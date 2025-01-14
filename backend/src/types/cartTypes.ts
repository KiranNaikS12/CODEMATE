import mongoose, {Document, ObjectId} from "mongoose";
import { ICourse } from "./courseTypes";


export interface ICartItem {
    course: mongoose.Types.ObjectId;
    price: number;
    _id?:mongoose.Types.ObjectId
}

export interface ICart extends Document {   
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    items: ICartItem[];
    cartTotal: number;
    cartItemCount: number;
    
}

export interface IPopulatedCartItem {
    course: ICourse;
    _id: mongoose.Types.ObjectId;
}


// Interfacefor populated cart item
export interface IPopulatedCart extends Omit<ICart, 'items'> {
    items: IPopulatedCartItem[];
}

// Interface for cart with populated items
export interface ICartItemResponse {
    _id: string;
    course: {
        _id: string;
        title: string;
        coverImage: string;
        tutorName: string;
        language: string;
        subject: string;
        category: string;
        price: number;
        discount?: number;
    };
}

export interface ICartResponse {
    _id: string;
    user: string;
    items: ICartItemResponse[];
    cartTotal: number;
    cartItemCount: number;
}