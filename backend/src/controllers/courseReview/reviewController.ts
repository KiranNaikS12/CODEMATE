import { Request, Response} from 'express';
import { inject, injectable } from 'inversify';
import { handleErrorResponse } from '../../utils/HandleErrorResponse';
import { HttpStatusCode } from '../../utils/httpStatusCode';
import { formatResponse } from '../../utils/responseFormatter';
import { AuthMessages } from '../../utils/message';
import { IReviewService } from '../../services/coureseReviewService/IReviewService';

@injectable()
export class ReviewController {
    constructor(
        @inject('ReviewService') private ReviewService : IReviewService
    ) {}

    async addCourseReview(req: Request, res: Response): Promise<void> {
        try {
            const { userId, courseId, ratings, title, feedback } = req.body;
            const reviewDetails = { ratings, title, feedback };
            const review = await this.ReviewService.addCourseReview(userId, courseId, reviewDetails);
            res.status(HttpStatusCode.CREATED).json(formatResponse(review, AuthMessages.REVIEW_ADDED_SUCCESSFULLY));
        } catch (error) {
            console.log('error', error);
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async listCourseReview (req: Request, res: Response) : Promise<void> {
       try {
          const { id } = req.params;
          const review = await this.ReviewService.listCourseReviews(id);
          res.status(HttpStatusCode.Ok).json(formatResponse(review, AuthMessages.REVEIW_LISTED_SUCCESSFULLY))
       }  catch (error) {
          handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
       }
    }

    async addProblemReview(req:Request, res:Response ) : Promise<void> {
        try {
            const { userId, problemId, ratings, reviews } = req.body;
            const reviewDetails = { ratings, reviews};
            const review = await this.ReviewService.addProblemReviews(userId, problemId, reviewDetails);
            res.status(HttpStatusCode.CREATED).json(formatResponse(AuthMessages.REVIEW_ADDED_SUCCESSFULLY))
        }  catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async listProblemReviews (req:Request, res:Response) : Promise<void> {
        try {
            console.log('req reached')
            const { id } = req.params;
            const reviews = await this.ReviewService.listProblemReview(id);
            res.status(HttpStatusCode.Ok).json(formatResponse(reviews, AuthMessages.REVEIW_LISTED_SUCCESSFULLY))

        }   catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }
}