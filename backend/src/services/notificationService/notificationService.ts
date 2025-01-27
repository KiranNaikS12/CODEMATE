import mongoose from "mongoose";
import { inject, injectable } from "inversify";
import { INotificationRepository } from "../../repositories/notifications/INotificationRepository";
import { INotificationService } from "./INotificationService";
import { INotification } from "../../types/notificationTypes";
import { CustomError } from "../../utils/customError";
import { AuthMessages } from "../../utils/message";
import { HttpStatusCode } from "../../utils/httpStatusCode";

@injectable()
export class NotificationService implements INotificationService {
    constructor(
        @inject('NotificationRepository') private NotificationRepository: INotificationRepository
    ) { }

    async getUserNotification(userId: string) : Promise<INotification[]> {
        if(!userId) throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.BAD_REQUEST);

       const objectId = new mongoose.Types.ObjectId(userId);
       
       const notificationData = await this.NotificationRepository.find({
         receiverId: objectId,
         messageStatus: false,
         senderType: 'Tutor'
       })

       return notificationData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    async getTutorNotification(tutorId: string) : Promise<INotification[]> {
        if(!tutorId) throw new CustomError(AuthMessages.NO_TUTOR_FOUND, HttpStatusCode.BAD_REQUEST);

       const objectId = new mongoose.Types.ObjectId(tutorId);
       
       const notificationData = await this.NotificationRepository.find({
         receiverId: objectId,
         messageStatus: false,
         senderType: 'User'
       })

       return notificationData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    async removeNotification(notificationId: string) : Promise<boolean> {
        if(!notificationId) throw new CustomError(AuthMessages.NOTIFICATION_NOT_FOUND, HttpStatusCode.BAD_REQUEST);

        return await this.NotificationRepository.delete(notificationId)
    }

    async clearAllTutorNotification(tutorId: string) : Promise<boolean> {
        if(!tutorId) throw new CustomError(AuthMessages.NO_TUTOR_FOUND, HttpStatusCode.BAD_REQUEST);

        const objectId = new mongoose.Types.ObjectId(tutorId);

        return await this.NotificationRepository.deleteMany({
            receiverId: objectId,
        })
    }

    async clearAllUserNotification(userId: string) : Promise<boolean> {
        if(!userId) throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.BAD_REQUEST);

        const objectId = new mongoose.Types.ObjectId(userId);

        return await this.NotificationRepository.deleteMany({
            receiverId: objectId,
        })
    }
}