import { ApiResponse } from "./types";

export interface INotification {
    _id: string
    senderType: 'User' | 'Tutor',
    senderName: string;
    senderId: string;
    receiverType: 'User' | 'Tutor',
    ReceiverName: string;
    receiverId: string;
    messageStatus: boolean;
    text: string;
    createdAt: string;
}

export type showNotificationResponse = ApiResponse<INotification[]>