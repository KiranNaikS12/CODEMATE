import mongoose, {Schema} from 'mongoose';
import { IProblemReview } from '../types/reviewTypes';

const problemReviewSchema = new Schema<IProblemReview>({
    user: {type: Schema.Types.ObjectId, ref:'User', required: true},
    problem: {type: Schema.Types.ObjectId, ref:'Problem', required: true},
    ratings: {type:Number, required: true},
    reviews: {type:String, required: true}
}, {
    timestamps: true
})

const problemReviewModel = mongoose.model<IProblemReview>('ProblemReview', problemReviewSchema);
export default problemReviewModel