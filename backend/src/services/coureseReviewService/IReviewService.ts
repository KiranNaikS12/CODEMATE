import { IProblemReview, IReview } from "../../types/reviewTypes";

export interface IReviewService {
    addCourseReview(userId: string, courseId: string, reviewDetails: { ratings: number, title: string, feedback: string}) : Promise<IReview | null>;
    updateCourseReview(courseId: string) : Promise<void>;
    listCourseReviews(courseId: string) : Promise<Partial<IReview[]>>;
    addProblemReviews(userId: string, problemId: string, reviewDetails: {ratings: number, reviews: string}) : Promise<IProblemReview | null>;
    updateProblemReview(problemId: string) : Promise<void>;
    listProblemReview(problemId: string) : Promise<Partial<IProblemReview[]>>;
}