import { injectable, inject } from "inversify";
import { AuthMessages } from "../../utils/message";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { CustomError } from "../../utils/customError";
import { ICourseRepository } from "../../repositories/course/ICourseRepository";
import {  FilterOptions, IChapter, ICourse, ICourseData, IVideo, VideoUploadInfo } from "../../types/courseTypes";
import { getSignedUrl, uploadToS3 } from "../../config/s3";
import { ITutorRepository } from "../../repositories/tutor/ITutorRepository";
import { randomStrings } from "../../utils/randomeCourseName";
import { IOrder, IOrderResponse, IPopulatedOrder } from "../../types/orderTypes";
import { IPaymentRepository } from "../../repositories/payment/IPaymentRepository";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { ICourseService } from "./ICourseService";
import mongoose from "mongoose";


@injectable()
export class CourseService implements ICourseService {
    constructor(
        @inject('CourseRepository') private CourseRepository: ICourseRepository,
        @inject('TutorRepository') private TutorRepository : ITutorRepository,
        @inject('PaymentRepository') private PaymentRepository: IPaymentRepository,
        @inject('UserRepository') private UserRepository: IUserRepository
    ) {}

    async createCourse(courseDetails: Partial<ICourse>, files: Express.Multer.File[], id: string, coverImage: Express.Multer.File): Promise<ICourse | null> {
        try {
            const tutor = await this.TutorRepository.findById(id);
            
            if (!tutor) {
                throw new CustomError(AuthMessages.NO_TUTOR_FOUND, HttpStatusCode.NOT_FOUND);
            }
    
            const { title, description, level, category, lesson, language, subject, price, discount, chapters } = courseDetails;
            if (!title || !description || !level || !category || !lesson || !language || !subject || !price  || !chapters) {
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

                    if (videoIndex >=  chapterFiles.length) {
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

    async listCourse(filters: FilterOptions) : Promise<ICourse[]> {
        const courses = await this.CourseRepository.listCourses(filters)
        if(!courses || courses.length === 0) {
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
        
        // console.log("coursesWithSignedUrls",coursesWithSignedUrls)
        return coursesWithSignedUrls as ICourse[]
    }

    async listTutorCourse(tutorId: string) : Promise<ICourse[]> {
        if(!tutorId){
            throw new CustomError(AuthMessages.NO_TUTOR_FOUND, HttpStatusCode.BAD_REQUEST)
        }

        const tutor = await this.TutorRepository.findById(tutorId);
        if(!tutor) {
            throw new CustomError(AuthMessages.NO_TUTOR_FOUND, HttpStatusCode.BAD_REQUEST)
        }
        
        const courses = await this.CourseRepository.find({tutorId: tutor?._id});

        if(!courses || courses.length === 0) {
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

        return coursesWithSignedUrls;
        
    }

    async updateCourseStatus(id:string, isBlocked: boolean) : Promise<ICourse | null> {
       const courseStatus = await this.CourseRepository.update(id,{isBlocked});
       if(!courseStatus) {
          throw new CustomError(AuthMessages.COURSE_NOT_FOUND, HttpStatusCode.NOT_FOUND)
       }


       return courseStatus;
    }

    async viewCourseDetails(courseId: string): Promise<ICourseData> {
        if (!courseId) {
            throw new CustomError(AuthMessages.COURSE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        
        const course = await this.CourseRepository.findTutorByCourseId(courseId);
        if (!course) {
            throw new CustomError(AuthMessages.COURSE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
    
        // Generate signed URL for the course cover image
        const coverImageUrl = await getSignedUrl(process.env.S3_BUCKET_NAME!, course.coverImage);
        const chaptersWithSignedUrls = await Promise.all(course.chapters.map(async (chapter: IChapter) => {
            const videosWithSignedUrls = await Promise.all(chapter.videos.map(async (video: IVideo) => ({
                _id: video._id,
                title: video.title,
               
                video: await getSignedUrl(process.env.S3_BUCKET_NAME!, video.video),
                
            })));
    
            return {
                _id: chapter._id,
                title: chapter.title,
                videos: videosWithSignedUrls
            };
        }));
    
        return {
            _id: course._id.toString(),
            title: course.title,
            coverImage: coverImageUrl,
            tutorName: course.tutorName,
            tutorId: course.tutorId,
            description: course.description,
            level: course.level,
            category: course.category,
            lesson: course.lesson,
            language: course.language,
            subject: course.subject,
            price: course.price,
            discount: course.discount,
            averageRating: course.averageRating,
            reviewCount: course.reviewCount,
            isBlocked: course.isBlocked,
            chapters: chaptersWithSignedUrls
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
                        chapters: populatedCourse.chapters // Assuming chapters don't need signed URLs
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
}   