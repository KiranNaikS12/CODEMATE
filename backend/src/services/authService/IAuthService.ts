import { Request, Response} from 'express'
import { ITutor } from "../../types/tutorTypes";
import { IUser } from "../../types/userTypes";
import { Role } from '../../types/commonTypes';


export interface IAuthService {
   initiateRegistration(userDetails:any, res:Response) : Promise< {token: string}>;
   verifyUser(token: string, otp:string, res:Response): Promise<IUser | ITutor>;
   googleAuthUser(userDetails: any, res:Response) : Promise<IUser | ITutor | undefined>;
   loginUser(email: string, password: string, req:Request, res: Response) : Promise<IUser | ITutor>;
   forgetPassword(email:string, role:Role) : Promise<void>;
   validateResetToken(id: string, token:string) : Promise<void>;
   resetPassword(id:string, token:string, password:string): Promise<void>
   logoutUser(req: Request, res: Response) : Promise<void>
}