import  { Model, Document } from 'mongoose';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../../repositories/base/baseRepository';
import { INotification } from '../../types/notificationTypes';
import { INotificationRepository } from '../../repositories/notifications/INotificationRepository';

@injectable()
export class NotificationRepository extends BaseRepository<INotification> implements INotificationRepository {
    constructor(
        @inject('NotificationModel') private notificationModel: Model<INotification & Document> 
    ){
        super(notificationModel)
    }
}