import { CallStatus, ICallHistory } from "../../types/videoCallHistoryTypes";
import { IBaseRepository } from "../base/IBaseRepository";

export interface ICallHistoryRepository extends IBaseRepository<ICallHistory> {
    updateCallHistory(senderId: string, receiverId: string, callStatus: CallStatus) :  Promise<ICallHistory | null>
}