import { Document, Schema } from "mongoose";


export interface INotification extends Document{
    senderType: 'User' | 'Tutor',
    senderName: string;
    senderId: Schema.Types.ObjectId | string;
    receiverType: 'User' | 'Tutor',
    ReceiverName: string;
    receiverId: Schema.Types.ObjectId | string;
    messageStatus: boolean;
    text: string;
    createdAt: string;
}