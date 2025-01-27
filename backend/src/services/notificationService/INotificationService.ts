import { INotification } from "../../types/notificationTypes";


export interface INotificationService {
    getUserNotification(userId: string) : Promise<INotification[]>
    getTutorNotification(userId: string) : Promise<INotification[]>
    removeNotification(notificationId: string) : Promise<boolean>;
    clearAllTutorNotification(tutorId: string) : Promise<boolean>;
    clearAllUserNotification(tutorId: string) : Promise<boolean>;
}