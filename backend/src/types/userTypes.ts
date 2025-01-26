
import { FilterQuery } from "mongoose";
import { BaseUser } from "./commonTypes";
import { ITutor } from "./tutorTypes";


export interface CourseProgress {
    courseId: string;
    percentage: number; 
    chapters: Array<{
        chapterId: string;
        chapterProgress: number;
        videos: Array<{
            videoId: string;
            completed: boolean;
            lastWatchedAt: Date;
        }>;
    }>;
}


export interface IUser extends BaseUser {
    fullname: string;
    country:string,
    birthday?: string,
    bio: string,
    website?: string,
    work?: string;
    education:string;
    isApproved?: boolean;
    technicalSkills?: string;
    profileImage?:string,
    solvedEasy?: {
        solvedCount: number,
        totalPercentage: number;
        solvedProblemIds: string[];
    },
    solvedMedium?: {
        solvedCount: number;
        totalPercentage: number;
        solvedProblemIds: string[];
    };
    solvedHard?: {
        solvedCount: number;
        totalPercentage: number;
        solvedProblemIds: string[];
    };
    totalSubmission?: {
        count: number;
        submissions: Array<{
            problemId: string;
            title: string;
            language: string;
            status: string;
            submittedAt: Date;
            difficulty: 'easy' | 'medium' | 'hard';
        }>;
    };
    courseProgress?: CourseProgress[]
}

export interface RequestedCourseProgressData {
    userId: string;
    courseId: string;
    chapterId: string;
    videoId: string;
    completed: boolean;
}

//typeGuard 
export function isUser(user: IUser | ITutor) : user is IUser {
   return user.roleId === 'user'
}

export interface UserFilterQuery extends FilterQuery<IUser & Document> {
    searchTerm?: string;
}
