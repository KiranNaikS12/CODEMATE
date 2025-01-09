import { IBaseRepository } from "../base/IBaseRepository";
import {  Role } from "../../types/commonTypes";
import { IUser } from "../../types/userTypes";
import { ITutor } from "../../types/tutorTypes";

export interface IAuthRepository extends IBaseRepository<IUser | ITutor> {
    findByUsers(filter?: any): Promise<IUser[]>;
    findByTutors(filter?: any): Promise<ITutor[]>;
    checkExistingEmail(email: string, roleId: Role): Promise<IUser | ITutor | null >
    findByEmail(email: string): Promise<IUser | ITutor | null>;
    findByUserName(username: string, roleId: Role): Promise<IUser | ITutor | null>;
    checkRole(email: string, roleId: Role): Promise<IUser | ITutor | null>;
    createUser(userDetails: Partial<IUser>): Promise<IUser>;
    createTutor(userDetails: Partial<ITutor>): Promise<ITutor>;
    updateUser(id:string, data:Partial<IUser>): Promise<IUser | null>;
    updateTutor(id: string, data: Partial<ITutor>): Promise<ITutor | null>;
}

