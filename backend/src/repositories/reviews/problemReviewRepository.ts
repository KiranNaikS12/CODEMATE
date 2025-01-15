import { Model } from 'mongoose';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/baseRepository';
import { IProblemReview } from '../../types/reviewTypes';
import { IProblemReviewRepository } from './IProblemReviewRepository';



@injectable()
export class ProblemReviewRepository extends BaseRepository<IProblemReview> implements IProblemReviewRepository {

    constructor(
        @inject('ProblemReviewModel') private problemReviewModel: Model<IProblemReview>
    ) {
        super(problemReviewModel);
        this.problemReviewModel = problemReviewModel;
    }

    async listProblemReviews(problemId: string): Promise<IProblemReview[]> {
        return this.model.find({problem: problemId})
        .populate({
            path:'user',
            select: '_id username profileImage',
            model:'User'
        })
        .sort({createdAt: -1})
        .lean();
    }
}
