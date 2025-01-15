import { IReview } from "../../types/reviewTypes";
import { IBaseRepository } from "../base/IBaseRepository";

export interface IReviewRepository extends IBaseRepository<IReview> {
    listCourseReviews(courseId: string): Promise<IReview[]>;
}