import  mongoose,{Schema} from 'mongoose';
import { IFeedback } from '../types/feedbackTypes';


const feedbackSchema = new Schema<IFeedback>({
    user: {
        type: Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    problem: {
        type:Schema.Types.ObjectId,
        ref:'Problem',
        required: true
    },
    feedback: {
        type:String,
        required: true
    }
}, {
    timestamps: true
});

const feedbackModel = mongoose.model<IFeedback>('Feedback', feedbackSchema);
export default feedbackModel