import { inject, injectable } from "inversify";
import { IMessageRepository } from "../../repositories/message/IMessageRepository";
import { IMessage } from "../../types/messageTypes";
import { CustomError } from "../../utils/customError";
import { AuthMessages } from "../../utils/message";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { CloudinaryService } from "../../config/cloudinaryConfig";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { ITutorRepository } from "../../repositories/tutor/ITutorRepository";
import { IUser } from "../../types/userTypes";
import { ITutor } from "../../types/tutorTypes";
import { randomStrings } from '../../utils/randomeCourseName';
import { IMessageService } from "./IMessageService";


@injectable()
export class MessageService implements IMessageService {
    constructor(
        @inject('MessageRepository') private MessageRepository: IMessageRepository,
        @inject('CloudinaryService') private CloudinaryService: CloudinaryService,
        @inject('UserRepository') private UserRepository: IUserRepository,
        @inject('TutorRepository') private TutorRepository: ITutorRepository
    ) { }

    async resolveUserOrTutor(id: string): Promise<{ type: 'User' | 'Tutor'; data: IUser | ITutor }> {

        const user = await this.UserRepository.findById(id);
        if (user) return { type: 'User', data: user };

        const tutor = await this.TutorRepository.findById(id);
        if (tutor) return { type: 'Tutor', data: tutor }

        throw new CustomError(AuthMessages.USERS_NOT_FOUND, HttpStatusCode.NOT_FOUND)
    }

    async prepareMessage(receiverId: string, senderId: string, text: string | undefined, images: string[], timestamp: string, clientId?: string ) : Promise<Partial<IMessage>> {
        const sender = await this.resolveUserOrTutor(senderId);
        const receiver = await this.resolveUserOrTutor(receiverId);

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

    async saveMessageToDB(messageData: Partial<IMessage>) : Promise<IMessage> {
        const savedMessage = await this.MessageRepository.create(messageData);
        return savedMessage;
    }


    async getPreviousMessages(senderId: string, receiverId: string )  : Promise<IMessage[]> {
            await this.resolveUserOrTutor(senderId);
            await this.resolveUserOrTutor(receiverId);
    
            const message = await this.MessageRepository.find({
                $or:[
                    {senderId, receiverId},
                    {senderId: receiverId, receiverId: senderId}
                ]
            })
    
            message.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
            return message;

    }

    async markMessageAsRead(senderId: string, receiverId: string) : Promise<void> {
        const filter = {senderId: receiverId, receiverId: senderId, read: false};
        const update = {$set: {read: true}}

        const IsRead = await this.MessageRepository.updateMany(filter, update);
        console.log('Messages marked as read:', IsRead.modifiedCount);
    }
    
}