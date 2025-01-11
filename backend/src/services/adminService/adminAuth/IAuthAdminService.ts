import { AdminDashStats, IAdminAuth } from "../../../types/commonTypes";
import { Request, Response } from 'express';

export interface IAuthAdminService {
    loginAdmin(email: string, password: string, req:Request, res:Response) : Promise<IAdminAuth>;
    logoutAdmin (req: Request, res: Response) : Promise<void>;
    getDashStats () : Promise<AdminDashStats>;

}