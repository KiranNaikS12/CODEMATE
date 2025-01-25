import { TutorAdditonal } from "./tutorTypes";
import { ApiResponse } from "./types";

//courseFormTypes
export type Videos = {
        _id:string
        title:string,
        file:File
}

export type VideoUrl = {
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
}

export type listMyCourse = {
    courses: CourseTypes[];
    total: number
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