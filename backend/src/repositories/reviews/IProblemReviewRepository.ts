import { IProblemReview } from "../../types/reviewTypes";
import { IBaseRepository } from "../base/IBaseRepository";

export interface IProblemReviewRepository extends IBaseRepository<IProblemReview>{
    listProblemReviews(problemId: string) : Promise<IProblemReview[]>
}