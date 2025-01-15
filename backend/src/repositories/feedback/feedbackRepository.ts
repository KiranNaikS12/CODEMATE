import { Model, Document} from 'mongoose';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/baseRepository';
import { IFeedback } from '../../types/feedbackTypes';
import { IFeedbackRepository } from './IFeedbackRepository';

@injectable()
export class FeedbackRepository extends BaseRepository<IFeedback> implements IFeedbackRepository {
    constructor (
        @inject('FeedbackModel') private feedbackModel: Model<IFeedback & Document >
    ) {
        super(feedbackModel);
        this.feedbackModel = feedbackModel
    }

    async listProblemFeedback(problemId: string): Promise<IFeedback[]> {
        return this.model.find({ problem: problemId })
            .populate({
                path: 'user',
                select: '_id username profileImage',
                model: 'User'
            })
            .sort({ createdAt: -1 })
            .lean();
    }
  
}