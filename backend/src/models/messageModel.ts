import mongoose, { Schema } from 'mongoose'
import { IMessage } from '../types/messageTypes'



const messageSchema = new Schema<IMessage>({
    senderId: { type: Schema.Types.ObjectId, required: true },
    senderType: { type: String, enum: ['User', 'Tutor'], required: true }, 
    receiverId: { type: Schema.Types.ObjectId, required: true },
    receiverType: { type: String, enum: ['User', 'Tutor'], required: true }, 
    text: { type: String },
    images: [String ],
    read: { type: Boolean, default: false},
    timestamp: {type: String},
    clientId: {type: String, unique: true, sparse: true}
},  {
    timestamps: true
})

messageSchema.index({senderId: 1, receiverId: 1, timeStamp: 1})


const messageModel = mongoose.model<IMessage>('Message', messageSchema);
export default messageModel;