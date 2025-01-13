import {Request, Response} from 'express';
import { injectable, inject } from 'inversify';
import { HttpStatusCode } from '../../utils/httpStatusCode';
import { AuthMessages } from '../../utils/message';
import { handleErrorResponse } from '../../utils/HandleErrorResponse';
import { formatResponse } from '../../utils/responseFormatter';
import { CustomError } from '../../utils/customError';
import { IUserService } from '../../services/userService/IUserService';


@injectable()
export class UserProfileController{
    constructor(
        @inject('UserService') private UserService:IUserService
    ) {}

    async displayUser(req:Request,res:Response): Promise<void> {
        try{
           const {id} = req.params;
           const user = await this.UserService.displayUserData(id);
           res.status(HttpStatusCode.Ok).json(formatResponse(user, AuthMessages.USERS_LISTED_SUCCESSFULLY))
        } catch (error){
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async updateUserProfileDetails(req:Request, res:Response) : Promise<void> {
        try {
            const {id} = req.params;
            const {userData} = req.body;
            const userDetails =await this.UserService.updateUserData(id, userData);
            res.status(HttpStatusCode.CREATED).json(formatResponse(userDetails,AuthMessages.UPDATED_SUCCESSFULL))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async updateUserImage(req:Request, res:Response) : Promise<void> {
        try{
           const {id} = req.params;
           const file = req.file;
           if(!file){
            throw new CustomError(AuthMessages.IMAGE_FILE_DOESNOT_EXISTS, HttpStatusCode.BAD_REQUEST)
           }

           const updateUser = await this.UserService.updateUserProfile(id, file)
           res.status(HttpStatusCode.CREATED).json(formatResponse(updateUser,AuthMessages.PROFILE_UPLOADED_SUCCESSFULLY))
        } catch(error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async updateUserAccountInfo(req:Request, res:Response) : Promise<void> {
        try {
            const {id} = req.params;
            const {userData} = req.body;
            const userDetails = await this.UserService.updateAccountData(id, userData);
            res.status(HttpStatusCode.CREATED).json(formatResponse(userDetails, AuthMessages.UPDATED_SUCCESSFULL))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async updatePassword(req:Request, res:Response) : Promise<void> {
        try {
            const {id} = req.params;
            const { current_password, password} = req.body;
            await this.UserService.updateUserPassword(id, current_password, password);
            res.status(HttpStatusCode.Ok).json(formatResponse(null, AuthMessages.PASSOWRD_RESET_SUCCESSFULL))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async getDashboardStats(req: Request, res: Response) : Promise<void> {
        try {
            const { id } = req.params;
            const stats = await this.UserService.getDashboardStats(id);
            res.status(HttpStatusCode.Ok).json(formatResponse(stats, AuthMessages.FETCHED_DASHBOARD_STATS_SUCCESSFULLY))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }
}