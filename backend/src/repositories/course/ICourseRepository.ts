import { IBaseRepository } from "../base/IBaseRepository";
import { FilterOptions, ICourse } from "../../types/courseTypes";

export interface ICourseRepository extends IBaseRepository<ICourse> {
    findTutorByCourseId(courseId: string) : Promise<ICourse | null>
    listCourses(filter?: FilterOptions) :Promise<ICourse[]>;
}