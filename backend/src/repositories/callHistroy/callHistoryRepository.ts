import { Model, Document } from 'mongoose';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/baseRepository';
import { ICallHistoryRepository } from './ICallHistoryRepository';
import { CallStatus, ICallHistory } from 'types/videoCallHistoryTypes';


@injectable()
export class CallHistoryRepository extends BaseRepository<ICallHistory> implements ICallHistoryRepository {
    constructor(
        @inject('callHistroyModel') private callHistroyModel: Model<ICallHistory & Document>
    ){
        super(callHistroyModel)
    }

    async updateCallHistory(senderId: string, receiverId: string, callStatus: CallStatus): Promise<ICallHistory | null> {
        const existingCallHistory = await this.model.findOne({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }).sort({createdAt: -1});

        return existingCallHistory;
    }

}