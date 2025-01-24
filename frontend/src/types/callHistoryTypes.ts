export enum CallStatus {
    Sent = 'sent',
    Accepted = 'accepted',
    Rejected = 'rejected'
}

export interface ICallHistory extends Document {
    _id: string;
    senderId: string;
    receiverId: string;
    senderType: 'User' | 'Tutor';
    receiverType: 'User' | 'Tutor';
    callStatus: CallStatus;
    timestamp: string;
}