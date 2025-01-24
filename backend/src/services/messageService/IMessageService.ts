import { CallStatus, ICallHistory } from "types/videoCallHistoryTypes";
import { IMessage } from "../../types/messageTypes";
import { ITutor } from "../../types/tutorTypes";
import { IUser } from "../../types/userTypes";

export interface IMessageService {
    resolveUserOrTutor(id: string): Promise<{ type: 'User' | 'Tutor'; data: IUser | ITutor }>
    prepareMessage(receiverId: string, senderId: string, text: string | undefined, images: string[], timestamp: string, clientId?: string ) : Promise<Partial<IMessage>>;
    saveMessageToDB(messageData: Partial<IMessage>) : Promise<IMessage>;
    getPreviousMessages(senderId: string, receiverId: string )  : Promise<IMessage[]>;
    markMessageAsRead(senderId: string, receiverId: string) : Promise<void>;
    prepareCallHistory(receiverId: string, senderId: string, callStatus: CallStatus, timeStamp: string) : Promise<Partial<ICallHistory>>;
    createCallHistory(callData: Partial<ICallHistory>) : Promise<ICallHistory>
    updateCallHistory(senderId: string, receiverId: string, callStatus: CallStatus) :  Promise<ICallHistory | null>;
    getCallHistory(senderId: string, receiverId: string): Promise<ICallHistory[]>
}