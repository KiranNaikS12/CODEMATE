import  { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  senderId: Schema.Types.ObjectId | string;
  receiverId: Schema.Types.ObjectId | string;
  senderType: 'User' | 'Tutor';
  receiverType: 'User' | 'Tutor';
  courseId: Schema.Types.ObjectId | string;
  text?: string;
  images: string[],
  read: boolean;
  timestamp:string
  clientId?: string
}