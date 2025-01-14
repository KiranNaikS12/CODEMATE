import { FilterQuery } from "mongoose";
import { BaseUser } from "./commonTypes";
import { IUser } from "./userTypes";

export interface ITutor extends BaseUser {
    fullname: string;
    age: string;
    contact: string;
    birthday: string;
    country: string;
    bio: string;
    specialization: string;
    education: string;
    company: string;
    experience: string;
    website:string,
    isApproved?: boolean;
    isVerified: boolean;
    profileImage?:string,
    certificate: string;
}

// defining typeGuard function for tutor 
export function isTutor(user: IUser | ITutor) : user is ITutor {
    return user.roleId === 'tutor'
}

//custom interface for tutorFilter
export interface TutorFilterQuery extends FilterQuery<ITutor & Document> {
    searchTerm?: string;
}



