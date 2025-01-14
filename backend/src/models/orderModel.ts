import mongoose, {Schema} from 'mongoose';
import { IOrder } from '../types/orderTypes';

const orderSchema = new Schema<IOrder>({
    cart: {
        type: Schema.Types.ObjectId,
        ref:'Cart',
        required:true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items: [
        {
            course: {
                type:Schema.Types.ObjectId,
                ref: 'Course',
                required: true
            }
        }
    ],
    paymentId: {
        type: String
    },
    paymentGateway: {
        type: String,
        required: true
    },
    paymentMethod: {
        type:String,
    },
    paymentStatus: {
        type:String,
        required: true,
        enum:['Success', 'Failed', 'Pending']
    },
    currency: {
        type: String,
    },
    platFormfee: {
        type:Number,
        default: 15
    },
    billTotal: {
        type: Number,   
        default: 0
    },
    gatewayStatus: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const orderModel = mongoose.model<IOrder>('Order', orderSchema);
export default orderModel;