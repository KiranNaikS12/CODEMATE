import { TutorAdditonal } from "./tutorTypes";
import { ApiResponse } from "./types";
import { CourseProgress } from "./userTypes";

//courseFormTypes
export type Videos = {
        _id:string
        title:string,
        file:File
}

export type VideoUrl = {
    _id: string
    chapterTitle:string,
    videos: Videos[]
}

export type CourseFormTypes = {
    title:string;
    description:string,
    level:string,
    category: string,
    videoUrl:VideoUrl[],
    lesson:number,
    language:string,
    subject:string,
    price:number,
    discount:number,
    coverImage:string
}



export type CourseTypes = {
    _id:string;
    title:string;
    tutorName:string;
    tutorId:TutorAdditonal;
    description:string;
    coverImage:string;
    level:string;
    category: string,
    chapters:VideoUrl[],
    lesson:number,
    language:string,
    subject:string,
    price:number,
    averageRating: number,
    reviewCount: number,
    discount:number,
    isBlocked:boolean;
    courseProgress?: CourseProgress
    
}


// Access video types
export type AcessVideoType = {
   _id: string,
   title:string,
   video:string
}

export type AccessVideoUrl = {
    _id: string,
    title:string,
    videos: AcessVideoType[]
}


export type AccessCourseTypes = {
    _id:string;
    title:string;
    tutorName:string;
    tutorId:TutorAdditonal;
    description:string;
    coverImage:string;
    level:string;
    category: string,
    chapters:AccessVideoUrl[],
    lesson:number,
    language:string,
    subject:string,
    price:number,
    averageRating: number,
    reviewCount: number,
    discount:number,
    isBlocked:boolean;
    userProgress?: CourseProgress,
    userName?: string; 
}

export type listMyCourse = {
    courses: CourseTypes[];
    total: number;
}

export interface VideoUploadSectionProps {
    values: CourseFormTypes;
    setFieldValue: (field: string, value:unknown) => void;
}

export interface PreviewState {
    [key: number]: string[];
}



export type showCourseDetailsResponse = ApiResponse<CourseTypes[]>

export type showTutorCourseDetailsResponse = ApiResponse<listMyCourse>

export type showCourseViewResponse = ApiResponse<AccessCourseTypes>

export interface FilterData {
    searchTerm?: string;
    page?: string;
    limit?: string;
}

//VIDEO_PROGRESS_PAYLOAD
export interface VideoProgressPayload {
    userId: string;
    courseId: string;
    chapterId: string;
    videoId: string;
    completed: boolean;
}
  