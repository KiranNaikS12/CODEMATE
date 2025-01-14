import {Request, Response} from 'express'
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { AuthMessages } from "../../utils/message";
import {inject, injectable} from 'inversify'
import { handleErrorResponse } from '../../utils/HandleErrorResponse';
import { formatResponse } from '../../utils/responseFormatter';
import { IMangeUserService } from '../../services/adminService/manageUsers/IManageUsersService';
import { FilterOptions } from '../../types/courseTypes';


@injectable()
export class ManageUserController {
    constructor(
        @inject('ManageUserService') private ManageUserService: IMangeUserService
    ){}

    async listUsers(req:Request,res:Response) : Promise<void> {
        try{
            const filters: FilterOptions = {
                searchTerm: req.query.searchTerm as string || ''
            }
            const users = await this.ManageUserService.listUsers(filters)
            res.status(HttpStatusCode.Ok).json(formatResponse(users,AuthMessages.USERS_LISTED_SUCCESSFULLY))
        }catch(error){
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async updateUsers(req:Request, res:Response) : Promise<void> {
        try {
            const {id} = req.params;
            const {isBlocked} = req.body;
            const status = await this.ManageUserService.updateUsers(id,  isBlocked);
            res.status(HttpStatusCode.CREATED).json(formatResponse(status,AuthMessages.UPDATED_SUCCESSFULL))
        } catch (error) {
           handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }
    
    async displayUserDetail(req:Request, res:Response) : Promise<void> {
        try {
            const {userId} = req.params;
            const userData = await this.ManageUserService.displayUserDetail(userId);
            res.status(HttpStatusCode.Ok).json(formatResponse(userData, AuthMessages.USERS_LISTED_SUCCESSFULLY))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
         
    }
}

