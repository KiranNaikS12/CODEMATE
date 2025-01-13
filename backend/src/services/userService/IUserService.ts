import { UserStats } from "../../types/commonTypes";
import { IUser } from "../../types/userTypes";


export interface IUserService {
    displayUserData(userId: string) : Promise<IUser>;
    updateUserData(id: string, userData: Partial<IUser>) : Promise<IUser>;
    updateUserProfile(id: string, file:Express.Multer.File) : Promise<IUser | null>;
    updateAccountData(id: string, userData: Partial<IUser>) : Promise<IUser>;
    updateUserPassword(id: string, current_password: string, password: string) : Promise<IUser>;
    getDashboardStats(userId: string) : Promise<UserStats>
}