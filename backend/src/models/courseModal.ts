import mongoose, {Schema} from "mongoose";
import { ICourse } from "../types/courseTypes";
import { IVideo } from "../types/courseTypes";
import { IChapter } from "../types/courseTypes";

// Individual video & title
const videoSchema = new Schema<IVideo>({
    title: { type: String, required: true },  
    video: { type: String, required: true }   
});

//Chapter title
const chapterSchema = new Schema<IChapter>({
    title: { type: String, required: true },    
    videos: [videoSchema]                       
});

const courseSchema = new Schema<ICourse>({
    title: {type: String, required:true},
    coverImage: {type:String, required:true},
    tutorName: {type:String, required:true},
    tutorId: {
        type: Schema.Types.ObjectId,
        ref:'Tutor',
        required: true
    },
    description: {type: String, required:true},
    level: {type: String, enum: ["beginner", "intermediate", "advanced"], required:true},
    category: {type: String, required:true},
    lesson: {type: Number, required:true},
    language: {type: String, required:true},
    subject: {type: String, required:true},
    price: {type: Number, required:true},
    discount: {type: Number, default: 0},
    averageRating: {type: Number, default: 0},
    reviewCount: {type: Number, default: 0},
    isBlocked:{type:Boolean, default:false},
    chapters: [chapterSchema]
},
{
    timestamps: true,
});

const courseModel = mongoose.model<ICourse>('Course', courseSchema);
export default courseModel;