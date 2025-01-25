import mongoose, {Document} from "mongoose";

export interface IVideo {
    title: string; 
    video: string;  
    _id?: mongoose.Types.ObjectId,
}

export interface IChapter {
    _id?:  mongoose.Types.ObjectId,
    title: string;
    videos: IVideo[];
}



export interface ICourse extends Document{
    _id:mongoose.Types.ObjectId,
    title:string,
    coverImage:string,
    tutorName:string,
    tutorId: mongoose.Types.ObjectId,
    description:string,
    level:string,
    category: string,
    lesson:number,
    language:string,
    subject:string,
    price:number,
    discount:number,
    averageRating: number,
    reviewCount: number,
    isBlocked:boolean,
    chapters: IChapter[]
}

export interface VideoUploadInfo {
    chapterTitle: string,
    videoTitles: string[],
    files: Express.Multer.File[]
}

export interface FilterOptions {
    searchTerm?: string; 
    page?: number;
    limit?: number;
}

export interface ICourseData {
    _id: string;
    title: string;
    coverImage: string;
    tutorName: string;
    tutorId: mongoose.Types.ObjectId
    description: string;
    level: string;
    category: string;
    lesson: number;
    language: string;
    subject: string;
    price: number;
    discount: number;
    averageRating: number;
    reviewCount: number;
    isBlocked: boolean;
    chapters: IChapter[];
}