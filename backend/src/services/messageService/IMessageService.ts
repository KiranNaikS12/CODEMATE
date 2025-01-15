import { IMessage } from "../../types/messageTypes";
import { ITutor } from "../../types/tutorTypes";
import { IUser } from "../../types/userTypes";

export interface IMessageService {
    resolveUserOrTutor(id: string): Promise<{ type: 'User' | 'Tutor'; data: IUser | ITutor }>
    prepareMessage(receiverId: string, senderId: string, text: string | undefined, images: string[], timestamp: string, clientId?: string ) : Promise<Partial<IMessage>>;
    saveMessageToDB(messageData: Partial<IMessage>) : Promise<IMessage>;
    getPreviousMessages(senderId: string, receiverId: string )  : Promise<IMessage[]>;
    markMessageAsRead(senderId: string, receiverId: string) : Promise<void>
}