import { Schema, Document } from 'mongoose';

export enum CallStatus {
    Sent = 'sent',
    Accepted = 'accepted',
    Rejected = 'rejected'
}

export interface ICallHistory extends Document {
    senderId: Schema.Types.ObjectId | string;
    receiverId: Schema.Types.ObjectId | string;
    senderType: 'User' | 'Tutor';
    receiverType: 'User' | 'Tutor';
    callStatus: CallStatus;
    timestamp: string;
}