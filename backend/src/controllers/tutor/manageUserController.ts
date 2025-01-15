import { Request, Response } from 'express';
import { injectable, inject } from "inversify";
import { handleErrorResponse } from '../../utils/HandleErrorResponse';
import { HttpStatusCode } from '../../utils/httpStatusCode';
import { formatResponse } from '../../utils/responseFormatter';
import { AuthMessages } from '../../utils/message';
import { IMangeUserService } from '../../services/tutorService/ManageUsers/IMangeUserService';

@injectable()
export class ManageEnrolledUserController {
    constructor(
        @inject('ManageEnrolledUser') private ManageEnrolledUser: IMangeUserService
    ) {}

    async listEnrolledUser(req:Request, res:Response) : Promise<void> {
        try {

            const { id } = req.params;
            const enrolledUsers = await this.ManageEnrolledUser.listEnrolledUser(id);
            res.status(HttpStatusCode.Ok).json(formatResponse(enrolledUsers, AuthMessages.USERS_LISTED_SUCCESSFULLY))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }
}