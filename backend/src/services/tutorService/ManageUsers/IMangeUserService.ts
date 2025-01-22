import { IUser } from "../../../types/userTypes";

export interface IMangeUserService {
    listEnrolledUser(tutorId: string, page: number, limit: number) : Promise<{users: IUser[], total: number}>
}