import { Response, Request} from 'express';
import { inject, injectable } from 'inversify';
import { INotificationService } from '../../services/notificationService/INotificationService';
import { handleErrorResponse } from '../../utils/HandleErrorResponse';
import { HttpStatusCode } from '../../utils/httpStatusCode';
import { formatResponse } from '../../utils/responseFormatter';
import { AuthMessages } from '../../utils/message';


@injectable()
export class NotificationController {
    constructor(
        @inject('NotificationService') private NotificationService: INotificationService
    ){}

    async getUserNotification(req:Request, res:Response) : Promise<void> {
        try {
            const { id } = req.params;
            const notificationData = await this.NotificationService.getUserNotification(id);
            res.status(HttpStatusCode.Ok).json(formatResponse(notificationData, AuthMessages.NOTIFICATION_LISTED_SUCCESSFULLY))

        } catch (error){
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async getTutorNotification(req:Request, res:Response) : Promise<void> {
        try {
            const { id } = req.params;
            const notificationData = await this.NotificationService.getTutorNotification(id);
            res.status(HttpStatusCode.Ok).json(formatResponse(notificationData, AuthMessages.NOTIFICATION_LISTED_SUCCESSFULLY))

        } catch (error){
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async removeNotification(req:Request, res:Response) : Promise<void> {
        try {
            const { notificationId } = req.body;
            await this.NotificationService.removeNotification(notificationId);
            res.status(HttpStatusCode.Ok).json(formatResponse(null, AuthMessages.NOTIFICATION_REMOVE_SUCCESSFULLY))
        } catch (error){
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async clearAllTutorNotification(req:Request, res:Response) : Promise<void> {
        try {
            const { tutorId } = req.body;
            await this.NotificationService.clearAllTutorNotification(tutorId);
            res.status(HttpStatusCode.Ok).json(formatResponse(null, AuthMessages.NOTIFICATION_CLEARTED_SUCCESSFULLY))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async clearAllUserNotification(req:Request, res:Response) : Promise<void> {
        try {
            const { userId } = req.body;
            await this.NotificationService.clearAllUserNotification(userId);
            res.status(HttpStatusCode.Ok).json(formatResponse(null, AuthMessages.NOTIFICATION_CLEARTED_SUCCESSFULLY))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }
}