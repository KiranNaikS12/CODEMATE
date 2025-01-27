import { inject, injectable } from "inversify";
import { IMessageRepository } from "../../repositories/message/IMessageRepository";
import { IMessage } from "../../types/messageTypes";
import { CustomError } from "../../utils/customError";
import { AuthMessages } from "../../utils/message";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { ITutorRepository } from "../../repositories/tutor/ITutorRepository";
import { IUser } from "../../types/userTypes";
import { ITutor } from "../../types/tutorTypes";
import { randomStrings } from '../../utils/randomeCourseName';
import { IMessageService } from "./IMessageService";
import { CallStatus, ICallHistory } from "../../types/videoCallHistoryTypes";
import { ICallHistoryRepository } from "../../repositories/callHistroy/ICallHistoryRepository";
import { INotificationRepository } from "../../repositories/notifications/INotificationRepository";


@injectable()
export class MessageService implements IMessageService {
    constructor(
        @inject('MessageRepository') private MessageRepository: IMessageRepository,
        @inject('UserRepository') private UserRepository: IUserRepository,
        @inject('TutorRepository') private TutorRepository: ITutorRepository,
        @inject('CallHistoryRepository') private CallHistoryRepository: ICallHistoryRepository,
        @inject('NotificationRepository') private NotificationRepository: INotificationRepository
    ) { }

    private extractName(entity: IUser | ITutor): string {
        return (entity as any).fullname || (entity as any).username || 'Unknown';
    }

    async resolveUserOrTutor(id: string): Promise<{ type: 'User' | 'Tutor'; data: IUser | ITutor } | null> {

        const user = await this.UserRepository.findById(id);
        if (user) return { type: 'User', data: user };

        const tutor = await this.TutorRepository.findById(id);
        if (tutor) return { type: 'Tutor', data: tutor }

        return null;
    }

    async prepareMessage(receiverId: string, senderId: string, text: string | undefined, images: string[], clientId?: string): Promise<Partial<IMessage>> {
        const sender = await this.resolveUserOrTutor(senderId);
        const receiver = await this.resolveUserOrTutor(receiverId);

        if (!sender || !receiver) {
            throw new CustomError(AuthMessages.USERS_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const notfiication = await this.createNotification(sender, receiver, text)
        const uniqueId = randomStrings(10)

        return {
            senderId,
            senderType: sender.type,
            receiverId,
            receiverType: receiver.type,
            text,
            images: images.length > 0 ? images : undefined,
            timestamp: new Date().toISOString(),
            clientId: uniqueId,
        };
    }

    async saveMessageToDB(messageData: Partial<IMessage>): Promise<IMessage> {
        const savedMessage = await this.MessageRepository.create(messageData);
        return savedMessage;
    }


    async getPreviousMessages(senderId: string, receiverId: string): Promise<IMessage[]> {
        await this.resolveUserOrTutor(senderId);
        await this.resolveUserOrTutor(receiverId);

        const message = await this.MessageRepository.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        })

        message.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return message;
    }

    async markMessageAsRead(senderId: string, receiverId: string): Promise<void> {
        const filter = { senderId: receiverId, receiverId: senderId, read: false };
        const update = { $set: { read: true } }

        await this.MessageRepository.updateMany(filter, update);
    }

    async MarkMessageNotification(senderId: string, receiverId: string): Promise<void> {
        const filter = { 
            senderId: receiverId, 
            receiverId: senderId, 
            messageStatus: false 
        };
        const update = { $set: { messageStatus: true } };
        await this.NotificationRepository.updateMany(filter, update);
    }

    async prepareCallHistory(receiverId: string, senderId: string, callStatus: CallStatus,): Promise<Partial<ICallHistory>> {
        const sender = await this.resolveUserOrTutor(senderId);
        const receiver = await this.resolveUserOrTutor(receiverId);

        if (!sender || !receiver) {
            throw new CustomError(AuthMessages.USERS_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        return {
            senderId,
            senderType: sender.type,
            receiverId,
            receiverType: receiver.type,
            callStatus,
            timestamp: new Date().toISOString(),
        };
    }

    async createCallHistory(callData: Partial<ICallHistory>): Promise<ICallHistory> {
        try {
            return await this.CallHistoryRepository.create(callData);
        } catch (error) {
            throw new CustomError(AuthMessages.FAILED_TO_SAVE_CALL_HISTORY, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async updateCallHistory(senderId: string, receiverId: string, callStatus: CallStatus): Promise<ICallHistory | null> {
        //finding the most recent call history
        const existingCallHistory = await this.CallHistoryRepository.updateCallHistory(senderId, receiverId, callStatus);

        if (!existingCallHistory) {
            throw new CustomError(AuthMessages.FAILED_TO_UPDATE_CALL_HISTORY, HttpStatusCode.BAD_REQUEST)
        }

        existingCallHistory.callStatus = callStatus;
        return existingCallHistory.save()
    }

    async getCallHistory(senderId: string, receiverId?: string): Promise<ICallHistory[]> {
        try {
            const query = receiverId
                ? {
                    $or: [
                        { senderId, receiverId },
                        { senderId: receiverId, receiverId: senderId }
                    ]
                }
                : {
                    $or: [
                        { senderId },
                        { receiverId: senderId }
                    ]
                };

            const callHistory = await this.CallHistoryRepository.find(query);
            return callHistory.sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
        } catch (error) {
            throw new CustomError(AuthMessages.FAILED_TO_FETCH_CALL_HISTORY, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    private async createNotification(sender: { type: 'User' | 'Tutor', data: IUser | ITutor },
        receiver: { type: 'User' | 'Tutor', data: IUser | ITutor },
        text?: string): Promise<void> {
        const senderName = this.extractName(sender.data);
        const receiverName = this.extractName(receiver.data);

        await this.NotificationRepository.create({
            senderType: sender.type,
            receiverType: receiver.type,
            senderName: senderName,
            ReceiverName: receiverName,
            senderId: sender.data._id.toString(),
            receiverId: receiver.data._id.toString(),
            text: text || 'New Message',
            messageStatus: false
        });
    }

}