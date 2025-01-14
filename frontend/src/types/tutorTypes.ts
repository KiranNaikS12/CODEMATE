import { ApiResponse } from "./types";

export interface TutorHeaderProps {
   toggleSearch?: () => void;
   isSearchOpen?: boolean
}

export interface Tutor {
   _id: string,
   username: string,
   email: string,
   contact?: string,
   isApproved:boolean,
   isVerified?:boolean,
   createdAt: string,
   isBlocked: boolean,
   profileImage?: string
}

export type ListTutorResponse = ApiResponse<Tutor[]>


export type ApprovalFormData = {
   fullname:string,
   age:string,
   country:string,
   contact:string,
   birthday:string,
   bio?:string
   specialization:string,
   education:string,
   experience:string,
   company?:string,
   certificate?:File | null
}

export interface TutorAdditonal extends Tutor {
   fullname:string,
   age:string,
   country:string,
   contact?:string,
   birthday?:string,
   bio:string
   specialization?:string,
   education:string,
   experience?:string,
   company?:string,
   website:string;
   isVerified?:boolean,
   profileImage?:string,
   certificate?:File | null
}

export type showTutorDetailResponse = ApiResponse<TutorAdditonal>

export type TutorProfileFormType = {
   bio: string;
   fullname:string;
   dob:string;
   country:string;
   contact:string;
   age:string;
   website:string;
   education:string;
   experience: string;
   company:string;
   specialization:string;
}