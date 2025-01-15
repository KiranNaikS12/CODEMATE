import { IUser } from "../../../types/userTypes";

export interface IMangeUserService {
    listEnrolledUser(tutorId: string) : Promise<IUser[]>
}