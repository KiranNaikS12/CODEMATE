import { Model, Document} from 'mongoose';
import { inject, injectable } from 'inversify';
import { IReviewRepository } from './IReviewRepository';
import { BaseRepository } from '../base/baseRepository';
import { IReview } from '../../types/reviewTypes';

@injectable()
export class ReviewRepository extends BaseRepository<IReview> implements IReviewRepository {
    constructor (
        @inject('ReviewModel') private reviewModel :  Model<IReview & Document>
    ) {
        super(reviewModel);
        this.reviewModel = reviewModel
    }

    async listCourseReviews(courseId: string): Promise<IReview[]> {
        return this.model.find({course: courseId})
        .populate({
            path:'user',
            select: '_id username profileImage',
            model:'User'
        })
        .sort({createdAt: -1})
        .lean();

    }
}