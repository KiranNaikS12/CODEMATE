import { FilterOptions } from "../../../types/courseTypes";
import { IUser } from "../../../types/userTypes";

export interface IMangeUserService {
    listUsers(filters: FilterOptions) : Promise<IUser[]>
    updateUsers(id:string, isBlocked: boolean): Promise<IUser>
    displayUserDetail(userId: string) : Promise<IUser>
}