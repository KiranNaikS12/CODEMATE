import mongoose, {Schema} from 'mongoose';
import { ICart } from '../types/cartTypes';

const cartSchema = new Schema<ICart>({
    user: {
        type: Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[
        {
            course:{
                type:Schema.Types.ObjectId,
                ref:'Course',
                required:true
            },
            price:{
                type:Number,
                required:true
            }
        }
    ],
    cartTotal:{
        type:Number,
        required:true,
        default:0
    },
    cartItemCount:{
        type:Number,
        required:true,
        default:0
    }
}, {
    timestamps: true,
});

const cartModel = mongoose.model<ICart>('Cart', cartSchema);
export default cartModel;