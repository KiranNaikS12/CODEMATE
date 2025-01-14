import { FilterOptions, ICourse, ICourseData } from "../../types/courseTypes";
import { IOrder, IOrderResponse } from "../../types/orderTypes";

export interface ICourseService {
    createCourse(courseDetails: Partial<ICourse>, files: Express.Multer.File[], id: string, coverImage: Express.Multer.File): Promise<ICourse | null>;
    listCourse( filters: FilterOptions) : Promise<ICourse[]>;
    listTutorCourse(tutorId: string) : Promise<ICourse[]>;
    updateCourseStatus(id:string, isBlocked: boolean) : Promise<ICourse | null>;
    viewCourseDetails(courseId: string) : Promise<ICourseData>;
    listEnrolledCourses(userId: string) : Promise<IOrderResponse[]>
}