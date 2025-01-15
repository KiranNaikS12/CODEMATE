import { Model, Document } from 'mongoose';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/baseRepository';
import { IMessageRepository } from './IMessageRepository';
import { IMessage } from '../../types/messageTypes';


@injectable()
export class MessageRepository extends BaseRepository<IMessage> implements IMessageRepository {
    constructor(
        @inject('MessageModel') private messageModel: Model<IMessage & Document>
    ){
        super(messageModel)
    }
}