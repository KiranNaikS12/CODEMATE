import { ApiResponse } from "./types";

export interface User {
    _id: string,
    username: string,
    email: string,
    contact?: string,
    createdAt: string,
    isBlocked: boolean
}

export interface ListUser {
    users: User[];
    totalUsers: number
}


export type ListUsersResponse = ApiResponse<ListUser>



export interface TotalSubmission {
    count: number;
    submissions: Array<{
        problemId: string;
        title: string;
        language: string;
        status: string;
        submittedAt: Date;
        difficulty: 'easy' | 'medium' | 'hard';
    }>;
}

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

export interface UserAdditional extends User {
    fullname: string,
    country: string,
    birthday: string,
    bio?: string,
    website?: string,
    work?: string,
    education: string,
    TechnicallSkills?: string;
    profileImage?: string;
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
    totalSubmission?: TotalSubmission,
    courseProgress?: CourseProgress[]
}

export interface EnrolledStudents {
    users: UserAdditional[],
    total: number;
}


export type showUserDetailsResponse = ApiResponse<UserAdditional>
export type showEnrolledUsersResponse = ApiResponse<EnrolledStudents>


export interface HeaderProps {
    userProfile: string | undefined
}

export type ProfileFormType = {
    bio?: string;
    fullname?: string;
    birthday?: string;
    country?: string;
    website?: string;
    work?: string;
    education?: string;
    TechnicallSkills?: string;

}

export const PROFILE_DEFAULTS = {
    bio: "Write something about you",
    website: "Your blog, Portfolio, etc",
    fullname: "Not Provided",
    birthday: "Not Provided",
    country: "Not Provided",
    work: "Not Provided",
    education: "Not Provided",
    TechnicallSkills: "Not Provided"
} as const;


