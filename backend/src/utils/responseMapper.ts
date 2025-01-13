import { IAdminAuth, Role } from "../types/commonTypes";
import { isUser, IUser } from "../types/userTypes";
import { ITutor } from "../types/tutorTypes";
import { isTutor } from "../types/tutorTypes";

export interface UserDto {
    _id: string;
    username: string;
    email: string;
    roleId: Role;
    fullname: string;
    isBlocked: boolean;
    createdAt: Date;
    birthday?:string,
    contact?: string;
    specialization?: string;
    education?: string;
    company?: string;
    experience?: string;
    isApproved?:boolean;
    isVerified?: boolean;
    emailVerified?: boolean;
    website?: string,
    work?: string;
    technicalSkills?: string;
    certificate?: string;
    profileImage?: string | null;
}

export const mapUserResponse = (user:IUser | ITutor) : UserDto => {
   const baseResponse = {
     _id: user._id.toString(),
     username: user.username,
     email: user.email,
     fullname: user.fullname || '',
     roleId: user.roleId,
     isBlocked: user.isBlocked,
     createdAt: user.createdAt,
     profileImage: user.profileImage || '',
   };

   if(isTutor(user)){
      return {
        ...baseResponse,
        isApproved: user.isApproved
      };
   }

   return baseResponse;
}

export const mapGoogleAuthUserResponse = (user: IUser | ITutor ): UserDto => {
  const baseResponse = {
    _id: user._id.toString(),
    username:user.username || '',
    email:user.email,
    roleId:user.roleId,
    isBlocked: user.isBlocked || false,
    createdAt: user.createdAt || new Date(),
    fullname: user.fullname || '',
    country: user.country || '',
    bio: user.bio || '',
    birthday: user.birthday || '',
    education: user.education || '',
    profileImage: user.profileImage || ''
  };
  if(isTutor(user)) {
    return {
      ...baseResponse,
      isApproved: user.isApproved,
      specialization: user.specialization,
      experience: user.experience,
      company: user.company || '',
      contact: user.contact,
      certificate: user.certificate,
      isVerified: user.isVerified
    }
  }

  if(isUser(user)) {
    return {
      ...baseResponse,
      website: user.website,
      work: user.work,
      technicalSkills: user.technicalSkills,
    }
  }
  return baseResponse;
};

export interface AdminDto {
    email: string;
    roleId: Role
}

export const mapAdminResponse = (admin:IAdminAuth) : AdminDto => ({
    email: admin.email,
    roleId: admin.roleId
})
