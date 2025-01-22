import { Response, Request} from 'express';
import { inject, injectable } from 'inversify';
import { HttpStatusCode } from '../../utils/httpStatusCode';
import { AuthMessages } from '../../utils/message';
import { formatResponse } from '../../utils/responseFormatter';
import { handleErrorResponse } from '../../utils/HandleErrorResponse';
import { CustomError } from '../../utils/customError';
import { FilterOptions, IChapter } from '../../types/courseTypes';
import { ICourseService } from '../../services/courseService/ICourseService';


@injectable()
export class CourseController {
    constructor(
        @inject('CourseService') private CourseService: ICourseService
    ) {}

    async createCourse(req: Request, res: Response): Promise<void> {
        try {
            const courseDetailsJson = JSON.parse(req.body.courseDetails);
            const chaptersJson = JSON.parse(req.body.chapters);
            const { id } = req.params;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const videos = files['videos']; 
            const coverImage = files['coverImage'] ? files['coverImage'][0] : null;
    
            if (!coverImage) {
                throw new CustomError(AuthMessages.MISSING_COVER_IMAGE, HttpStatusCode.BAD_REQUEST);
            }
    
            const formattedChapters: IChapter[] = chaptersJson.map((chapter: any) => ({
                title: chapter.chapterTitle,
                videos: chapter.videoTitles.map((title: string) => ({
                    title: title,
                    video: '' 
                }))
            }));
            const courseDetails = {
                ...courseDetailsJson,
                chapters: formattedChapters
            };
 
            const newCourse = await this.CourseService.createCourse(courseDetails, videos, id, coverImage);  
            if (!newCourse) {
                throw new CustomError(AuthMessages.FAILED_TO_CREATE_COURSE, HttpStatusCode.INTERNAL_SERVER_ERROR);
            }
    
            res.status(HttpStatusCode.CREATED).json(formatResponse(null, AuthMessages.COURSE_CREATED_SUCCESSFULLY));
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }


    async listCourse(req:Request, res:Response) : Promise<void> {
        try {
            const filters: FilterOptions = {
                searchTerm: req.query.searchTerm as string || ''
            }
            const courseList = await this.CourseService.listCourse(filters);
            res.status(HttpStatusCode.Ok).json(formatResponse(courseList,AuthMessages.COURSE_LISTED_SUCCESSFULLY))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async listMyCourse(req:Request, res:Response) : Promise<void> {
        try {
            const { id } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 4;
            const course = await this.CourseService.listTutorCourse(id, page, limit);
            res.status(HttpStatusCode.Ok).json(formatResponse(course, AuthMessages.COURSE_LISTED_SUCCESSFULLY))

        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR) 
        }
    }


    async updateCourseStatus(req:Request, res:Response) : Promise<void> {
        try {
            const { id } = req.params;
            const { isBlocked} = req.body;
            const data = await this.CourseService.updateCourseStatus(id,isBlocked);
            if(!data) {
                throw new CustomError(AuthMessages.COURSE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }
            res.status(HttpStatusCode.CREATED).json(formatResponse(data, AuthMessages.COURSE_STATUS_UPDATED_SUCCESSFULLY))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async viewCourseDetails(req:Request, res:Response) : Promise<void> {
        try {
            const { id } = req.params;
            const courseData = await this.CourseService.viewCourseDetails(id);
            res.status(HttpStatusCode.Ok).json(formatResponse(courseData, AuthMessages.COURSE_LISTED_SUCCESSFULLY))
        }  catch (error) {
            console.log('error', error)
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async listEnrolledCourses(req:Request, res:Response) : Promise<void> {
        try {
            const { id } = req.params;
            const courseData = await this.CourseService.listEnrolledCourses(id);
            res.status(HttpStatusCode.Ok).json(formatResponse(courseData, AuthMessages.COURSE_LISTED_SUCCESSFULLY))
        } catch (error) {
            console.log('Error', error);
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

}