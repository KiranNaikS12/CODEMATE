import mongoose, {Schema} from 'mongoose';
import { IWishlist } from '../types/wishlistTypes';


const wishlistSchema = new Schema<IWishlist>({
    user:{
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
            }
        }
    ],
    totalItemCount: {
        type:Number,
        required:true,
        default:0
    }
},{
    timestamps:true
});

const wishlistModel = mongoose.model<IWishlist>('WishList', wishlistSchema);
export default wishlistModel;