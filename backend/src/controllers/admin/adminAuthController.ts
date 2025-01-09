import { Request, Response} from 'express';
import { AuthAdminService } from '../../services/adminService/adminAuth/authAdminService';
import { HttpStatusCode } from '../../utils/httpStatusCode';
import { AuthMessages } from '../../utils/message';
import { formatResponse } from '../../utils/responseFormatter';
import { inject, injectable } from "inversify";
import { IUser } from '../../types/userTypes';
import { mapAdminResponse } from '../../utils/responseMapper';
import { IAuthAdminService } from '../../services/adminService/adminAuth/IAuthAdminService';
import { IAdminAuth } from '../../types/commonTypes';

const handleErrorResponse = (res: Response, error: unknown, statusCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR) =>{
    const err = error as Error;
    res.status(statusCode).json(formatResponse(null, err.message, false))
}

@injectable()
export class AdminAuthController {
    constructor(
        @inject('AuthAdminService') private authAdminService: IAuthAdminService
    ) {}

    async loginAdmin(req: Request, res: Response) : Promise<void> {
        try{
             const {email, password} = req.body;
             const admin: IAdminAuth = await this.authAdminService.loginAdmin(email, password, req, res);
             res.status(HttpStatusCode.Ok).json(formatResponse(mapAdminResponse(admin), AuthMessages.LOGIN_SUCCESSFUL))
        }catch(error){
            handleErrorResponse(res, error, HttpStatusCode.BAD_REQUEST)
        }
    }

    async logoutAdmin (req: Request, res: Response) : Promise<void> {
        try{
            await this.authAdminService.logoutAdmin(req,res);
            res.status(HttpStatusCode.Ok).json(formatResponse(null, AuthMessages.USER_LOGOUT))
        } catch(error) {
            
            handleErrorResponse(res, error, HttpStatusCode.BAD_REQUEST)
        }
    }

    async getDashStats (req:Request, res:Response) : Promise<void> {
        try {
            const stats = await this.authAdminService.getDashStats();
            console.log(stats)
            res.status(HttpStatusCode.Ok).json(formatResponse(stats, AuthMessages.FETCHED_DASHBOARD_STATS_SUCCESSFULLY))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.BAD_REQUEST)
        }
    }
}
