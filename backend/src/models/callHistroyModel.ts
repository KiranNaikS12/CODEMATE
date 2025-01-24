import mongoose, {Schema} from "mongoose";
import { CallStatus, ICallHistory } from "../types/videoCallHistoryTypes";


const callHistroySchema = new Schema<ICallHistory>({
    senderId: { type: Schema.Types.ObjectId, required: true },
    senderType: { type: String, enum: ['User', 'Tutor'], required: true }, 
    receiverId: { type: Schema.Types.ObjectId, required: true },
    receiverType: { type: String, enum: ['User', 'Tutor'], required: true }, 
    callStatus: {type: String, enum: CallStatus, required: true, default: CallStatus.Sent},
    timestamp: {type: String},
}, {
    timestamps: true
})

const callHistroyModel = mongoose.model<ICallHistory>('History', callHistroySchema);
export default callHistroyModel;