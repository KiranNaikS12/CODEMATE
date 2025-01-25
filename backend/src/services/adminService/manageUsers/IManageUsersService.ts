import { FilterOptions } from "../../../types/courseTypes";
import { IUser } from "../../../types/userTypes";

export interface IMangeUserService {
    listUsers(filters: FilterOptions, page: number, limit: number): Promise<{users: IUser[], totalUsers: number }>
    updateUsers(id:string, isBlocked: boolean): Promise<IUser>
    displayUserDetail(userId: string) : Promise<IUser>
}