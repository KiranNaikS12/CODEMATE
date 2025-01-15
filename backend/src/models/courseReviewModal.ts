import mongoose, {Schema} from 'mongoose'
import { IReview } from "../types/reviewTypes";

const reviewSchema = new Schema<IReview>({
    user: {
        type: Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref:'Course',
        required: true
    },
    ratings: {
        type: Number,
        required: true
    },
    title: {
        type:String,
        required: true
    },
    feedback: {
        type: String,
        required: true
    }
} ,{
    timestamps: true
});

const reviewModel = mongoose.model<IReview>('Review', reviewSchema);
export default reviewModel;