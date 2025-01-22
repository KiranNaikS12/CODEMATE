import { IBaseRepository } from "../base/IBaseRepository";
import { FilterOptions, ICourse } from "../../types/courseTypes";

export interface ICourseRepository extends IBaseRepository<ICourse> {
    findTutorByCourseId(courseId: string) : Promise<ICourse | null>;
    listPaginatedTutorCourse(tutorId: string, page: number, limit: number) : Promise<{ courses: ICourse[]; total: number }>
    listCourses(filter?: FilterOptions) :Promise<ICourse[]>;
}