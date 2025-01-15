import { Request, Response} from 'express';
import { inject, injectable } from 'inversify';
import { handleErrorResponse } from '../../utils/HandleErrorResponse';
import { HttpStatusCode } from '../../utils/httpStatusCode';
import { formatResponse } from '../../utils/responseFormatter';
import { AuthMessages } from '../../utils/message';
import { IProblemFeedbackService } from '../../services/feedbackService/IProblemFeedbackService';

@injectable()
export class FeedbackController {
    constructor (
        @inject('ProblemFeedbackService') private ProblemFeedbackService : IProblemFeedbackService
    ) {}

    async addFeedback (req:Request, res: Response) : Promise<void> {
        try {
            const { userId, problemId, feedback } = req.body;
            console.log('Feedback', feedback)
            const feed = await this.ProblemFeedbackService.addProblemFeedback(userId, problemId, feedback);
            res.status(HttpStatusCode.CREATED).json(formatResponse(feed, AuthMessages.FEEDBACK_ADDED_SUCCESSFULLY))
        }  catch (error) {
            console.log('Error', error)
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async listProblemFeedback( req:Request, res: Response) : Promise<void> {
        try {
              const { id } = req.params;
              const feed = await this.ProblemFeedbackService.listProblemFeedback(id);
              res.status(HttpStatusCode.Ok).json(formatResponse(feed, AuthMessages.FEEDBACK_LESTED_SUCCESSFULLY))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }
}