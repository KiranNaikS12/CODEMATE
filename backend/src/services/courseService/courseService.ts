import { injectable, inject } from "inversify";
import { AuthMessages } from "../../utils/message";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { CustomError } from "../../utils/customError";
import { ICourseRepository } from "../../repositories/course/ICourseRepository";
import { FilterOptions, IChapter, ICourse, ICourseData, IVideo, VideoUploadInfo } from "../../types/courseTypes";
import { getSignedUrl, uploadToS3 } from "../../config/s3";
import { ITutorRepository } from "../../repositories/tutor/ITutorRepository";
import { randomStrings } from "../../utils/randomeCourseName";
import { IOrder, IOrderResponse, IPopulatedOrder } from "../../types/orderTypes";
import { IPaymentRepository } from "../../repositories/payment/IPaymentRepository";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { ICourseService } from "./ICourseService";
import { CourseProgress, IUser, RequestedCourseProgressData } from "types/userTypes";
import { progress } from "@nextui-org/react";



@injectable()
export class CourseService implements ICourseService {
    constructor(
        @inject('CourseRepository') private CourseRepository: ICourseRepository,
        @inject('TutorRepository') private TutorRepository: ITutorRepository,
        @inject('PaymentRepository') private PaymentRepository: IPaymentRepository,
        @inject('UserRepository') private UserRepository: IUserRepository
    ) { }

    async createCourse(courseDetails: Partial<ICourse>, files: Express.Multer.File[], id: string, coverImage: Express.Multer.File): Promise<ICourse | null> {
        try {
            const tutor = await this.TutorRepository.findById(id);

            if (!tutor) {
                throw new CustomError(AuthMessages.NO_TUTOR_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const { title, description, level, category, lesson, language, subject, price, discount, chapters } = courseDetails;
            if (!title || !description || !level || !category || !lesson || !language || !subject || !price || !chapters) {
                throw new CustomError(AuthMessages.MISSING_REQUIRED_FIELDS, HttpStatusCode.BAD_REQUEST);
            }

            console.log("All uploaded files:", files.map(file => file.originalname));

            const coverImageKey = `coverImage/${title}/cover-${Date.now()}`;
            const coverImageFileKey = await uploadToS3(coverImage, process.env.S3_BUCKET_NAME!, coverImageKey);

            const cumulativeVideoCounts = chapters.reduce((acc, chapter) => {
                const prevTotal = acc.length > 0 ? acc[acc.length - 1] : 0;
                return [...acc, prevTotal + (chapter.videos?.length || 0)];
            }, [0]);

            console.log("Cumulative Video Counts:", cumulativeVideoCounts);


            const chaptersWithVideos: IChapter[] = await Promise.all(chapters.map(async (chapter: IChapter, chapterIndex: number) => {
                const startIndex = cumulativeVideoCounts[chapterIndex];
                const endIndex = cumulativeVideoCounts[chapterIndex + 1];

                const chapterFiles = files.slice(startIndex, endIndex);


                const videos: IVideo[] = await Promise.all(chapter.videos.map(async (video: IVideo, videoIndex: number) => {

                    if (videoIndex >= chapterFiles.length) {
                        throw new CustomError(AuthMessages.FILE_SORTAGE, HttpStatusCode.BAD_REQUEST);
                    }

                    const randomString = randomStrings(8)
                    const fileKey = `course/${title}/chapter-${chapterIndex + 1}/video-${videoIndex + 1}-${randomString}-${video.title}`;
                    const videoFileKey = await uploadToS3(
                        chapterFiles[videoIndex],
                        process.env.S3_BUCKET_NAME!,
                        fileKey
                    );

                    // console.log(`Uploaded URL for Video ${videoIndex + 1} in Chapter ${chapterIndex + 1}:`, videoUrl);

                    return {
                        title: video.title,
                        video: videoFileKey // store only the file key
                    };
                }));

                return {
                    title: chapter.title,
                    videos
                };
            }));

            console.log("Chapters with videos:", JSON.stringify(chaptersWithVideos, null, 2));

            const newCourse = await this.CourseRepository.create({
                ...courseDetails,
                tutorName: tutor.fullname,
                tutorId: tutor._id,
                chapters: chaptersWithVideos,
                coverImage: coverImageFileKey
            });

            return newCourse;
        } catch (error) {
            console.log("service error", error);
            throw new CustomError(AuthMessages.FAILED_TO_CREATE_COURSE, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async listCourse(filters: FilterOptions): Promise<ICourse[]> {
        const courses = await this.CourseRepository.listCourses(filters)
        if (!courses || courses.length === 0) {
            return [];
        }

        // Convert Mongoose documents to plain objects first
        const plainCourses = courses.map(course => course.toObject());

        //Generate signed URLS for all courses
        const coursesWithSignedUrls = await Promise.all(plainCourses.map(async (course) => {
            const coverImageUrl = await getSignedUrl(process.env.S3_BUCKET_NAME!, course.coverImage); //created signedUrl

            const chaptersWithSignedUrls = await Promise.all(course.chapters.map(async (chapter: IChapter) => {
                const videoWithSignedUrls = await Promise.all(chapter.videos.map(async (video) => ({
                    ...video,
                    video: await getSignedUrl(process.env.S3_BUCKET_NAME!, video.video)
                })));

                return {
                    ...chapter,
                    videos: videoWithSignedUrls
                };
            }));

            return {
                ...course,
                coverImage: coverImageUrl,
                chapters: chaptersWithSignedUrls
            }
        }));

        return coursesWithSignedUrls as ICourse[]
    }


    async listTutorCourse(tutorId: string, page: number, limit: number): Promise<{ courses: ICourse[]; total: number }> {
        if (!tutorId) {
            throw new CustomError(AuthMessages.NO_TUTOR_FOUND, HttpStatusCode.BAD_REQUEST)
        }

        const tutor = await this.TutorRepository.findById(tutorId);
        if (!tutor) {
            throw new CustomError(AuthMessages.NO_TUTOR_FOUND, HttpStatusCode.BAD_REQUEST)
        }

        const { courses, total } = await this.CourseRepository.listPaginatedTutorCourse(
            tutorId,
            page,
            limit
        );

        if (!courses || courses.length === 0) {
            return { courses: [], total: 0 };
        }

        // Convert Mongoose documents to plain objects first
        const plainCourses = courses.map(course => course.toObject());

        //Generate signed URLS for all courses
        const coursesWithSignedUrls = await Promise.all(plainCourses.map(async (course) => {
            const coverImageUrl = await getSignedUrl(process.env.S3_BUCKET_NAME!, course.coverImage); //created signedUrl

            const chaptersWithSignedUrls = await Promise.all(course.chapters.map(async (chapter: IChapter) => {
                const videoWithSignedUrls = await Promise.all(chapter.videos.map(async (video) => ({
                    ...video,
                    video: await getSignedUrl(process.env.S3_BUCKET_NAME!, video.video)
                })));

                return {
                    ...chapter,
                    videos: videoWithSignedUrls
                };
            }));

            return {
                ...course,
                coverImage: coverImageUrl,
                chapters: chaptersWithSignedUrls
            }
        }));

        return {
            courses: coursesWithSignedUrls,
            total
        }

    }

    async updateCourseStatus(id: string, isBlocked: boolean): Promise<ICourse | null> {
        const courseStatus = await this.CourseRepository.update(id, { isBlocked });
        if (!courseStatus) {
            throw new CustomError(AuthMessages.COURSE_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }


        return courseStatus;
    }

    async viewCourseDetails(courseId: string, userId: string): Promise<ICourseData> {
        if (!courseId) {
            throw new CustomError(AuthMessages.COURSE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const course = await this.CourseRepository.findTutorByCourseId(courseId);
        if (!course) {
            throw new CustomError(AuthMessages.COURSE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        //check if user has purchased the course:
        const orderExists = await this.PaymentRepository.findOne({
            user: userId,
            'items.course': courseId,
            paymentStatus: 'Success'
        })

        if(!orderExists) throw new CustomError(AuthMessages.COURSE_NOT_FOUND, HttpStatusCode.BAD_REQUEST);

        const userProgress = await this.UserRepository.findOne(
            {
                _id: userId,
                'courseProgress.courseId': courseId
            },
        )

        // Generate signed URL for the course cover image
        const coverImageUrl = await getSignedUrl(process.env.S3_BUCKET_NAME!, course.coverImage);
        const chaptersWithSignedUrls = await Promise.all(course.chapters.map(async (chapter: IChapter) => {
            const videosWithSignedUrls = await Promise.all(chapter.videos.map(async (video: IVideo) => ({
                _id: video._id,
                title: video.title,

                video: await getSignedUrl(process.env.S3_BUCKET_NAME!, video.video),
                progress: userProgress?.courseProgress?.find(
                    progress => progress.courseId === courseId
                )?.chapters.find(ch => ch.videos.some(v => v.videoId === video._id?.toString()))
                ?.videos.find(v => v.videoId === video._id?.toString())

            })));

            return {
                _id: chapter._id,
                title: chapter.title,
                videos: videosWithSignedUrls
            };
        }));

        return {
            ...course.toObject(),
            coverImage: coverImageUrl,
            chapters: chaptersWithSignedUrls,
            userProgress: userProgress?.courseProgress?.find(progress => progress.courseId === courseId),
            userName: userProgress ? (userProgress.fullname || userProgress.username) : undefined
        };
    }


    async listEnrolledCourses(userId: string): Promise<IOrderResponse[]> {
        if (!userId) {
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const user = await this.UserRepository.findById(userId);
        if (!user) {
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const orders = await this.PaymentRepository.listOrders(userId) as IPopulatedOrder[];
        if (orders.length === 0) {
            return [];
        }

        // Transform each order
        const ordersWithSignedUrls = await Promise.all(orders.map(async (order) => {
            // Process items within each order
            const itemsWithSignedUrls = await Promise.all(order.items.map(async (item) => {
                const populatedCourse = item.course;

                const courseProgress = user.courseProgress?.find(progress => progress.courseId === populatedCourse._id.toString())

                return {
                    _id: item._id.toString(),
                    course: {
                        _id: populatedCourse._id.toString(),
                        title: populatedCourse.title,
                        coverImage: await getSignedUrl(
                            process.env.S3_BUCKET_NAME!,
                            populatedCourse.coverImage
                        ),
                        tutorName: populatedCourse.tutorName,
                        language: populatedCourse.language,
                        subject: populatedCourse.subject,
                        category: populatedCourse.category,
                        price: populatedCourse.price,
                        discount: populatedCourse.discount,
                        chapters: populatedCourse.chapters,
                        courseProgress: courseProgress || null
                    }
                };
            }));

            return {
                _id: order._id.toString(),
                user: order.user.toString(),
                items: itemsWithSignedUrls,
                paymentId: order.paymentId,
                paymentGateway: order.paymentGateway,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                currency: order.currency,
                platFormfee: order.platFormfee,
                billTotal: order.billTotal,
                gatewayStatus: order.gatewayStatus
            };
        }));

        return ordersWithSignedUrls;
    }

    async updateUserCouseProgress(progressDetails: RequestedCourseProgressData): Promise<void> {
        const { userId, courseId, chapterId, videoId, completed } = progressDetails;

        const [userExists, courseExists] = await Promise.all([
            this.UserRepository.findById(userId),
            this.CourseRepository.findById(courseId)
        ]);

        if (!userExists) throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.BAD_REQUEST);
        if (!courseExists) throw new CustomError(AuthMessages.COURSE_NOT_FOUND, HttpStatusCode.BAD_REQUEST);

        // Ensure courseProgress exists
        if (!userExists.courseProgress) {
            userExists.courseProgress = [];
        }

        // Find or create course progress
        let existingCourseProgress = userExists.courseProgress.find(
            progress => progress.courseId === courseId
        );

        if (!existingCourseProgress) {
            existingCourseProgress = {
                courseId,
                percentage: 0,
                chapters: [
                    {
                        chapterId,
                        chapterProgress: 0,
                        videos: [
                            {
                                videoId,
                                completed,
                                lastWatchedAt: new Date()
                            }
                        ]
                    }
                ]
            };
            this.recalculateProgress(existingCourseProgress, courseExists);
            userExists.courseProgress.push(existingCourseProgress);
        }

        // Find chapter and validate video
        const chapter = courseExists.chapters.find(ch => ch._id?.toString() === chapterId);
        if (!chapter) throw new CustomError(AuthMessages.CHAPTER_NOT_FOUND, HttpStatusCode.BAD_REQUEST);

        const videoExists = chapter.videos.some(vid => vid._id?.toString() === videoId);
        if (!videoExists) throw new CustomError(AuthMessages.VIDEO_NOT_FOUND, HttpStatusCode.BAD_REQUEST);

        // Find or create chapter progress within course
        let chapterProgress = existingCourseProgress.chapters.find(
            ch => ch.chapterId === chapterId
        );

        if (!chapterProgress) {
            chapterProgress = {
                chapterId,
                chapterProgress: 0,
                videos: []
            };
            existingCourseProgress.chapters.push(chapterProgress);
        }

        const existingVideoProgress = chapterProgress.videos.find(
            vid => vid.videoId === videoId
        );

        if (existingVideoProgress) {
            if (existingVideoProgress.completed !== completed) {
                existingVideoProgress.completed = completed;
                existingVideoProgress.lastWatchedAt = new Date();
            }
        } else {
            chapterProgress.videos.push({
                videoId,
                completed,
                lastWatchedAt: new Date()
            });
        }

        this.recalculateProgress(existingCourseProgress, courseExists);
        await userExists.save();
    }

    private recalculateProgress(courseProgress: CourseProgress, course: ICourse) {
        courseProgress.chapters.forEach(chapterProgress => {
            const completedVideosCount = chapterProgress.videos.filter(v => v.completed).length;

            //chapter progress updated
            chapterProgress.chapterProgress = completedVideosCount;
        });
        const totalVideosInCourse = course.chapters.reduce(
            (total, chapter) => total + chapter.videos.length,
            0
        );

        const completedVideosInCourse = courseProgress.chapters.reduce(
            (total, chapter) => total + chapter.videos.filter(v => v.completed).length,
            0
        );
        //percentage updated
        courseProgress.percentage = totalVideosInCourse > 0
            ? Math.round((completedVideosInCourse / totalVideosInCourse) * 100)
            : 0;
    }

}

