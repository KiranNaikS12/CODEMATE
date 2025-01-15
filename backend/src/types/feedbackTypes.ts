import mongoose, {Document} from "mongoose";

export interface IFeedback extends Document{
    user: mongoose.Types.ObjectId,
    problem:mongoose.Types.ObjectId,
    feedback:string;
}