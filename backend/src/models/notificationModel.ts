import mongoose, { Schema } from 'mongoose'
import { INotification } from 'types/notificationTypes'

const notificationSchema = new Schema<INotification>({
    senderType : {type: String, required: true},
    receiverType: {type: String, required: true},
    senderName: {type: String, required: true},
    ReceiverName: {type: String, required: true},
    senderId: {type: Schema.Types.ObjectId, required: true},
    receiverId: {type: Schema.Types.ObjectId, required: true},
    messageStatus: {type:Boolean, default: false},
    text: {type: String, required: true}
}, {
    timestamps: true
})

const notificationModel = mongoose.model<INotification>('Notification', notificationSchema);
export default notificationModel;