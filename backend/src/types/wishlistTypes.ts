import mongoose, {Document, ObjectId} from "mongoose";
import { ICourse } from "./courseTypes";

export interface IWhishlistItem {
    course:mongoose.Types.ObjectId,
    _id?: mongoose.Types.ObjectId
}

export interface IWishlist extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    items: IWhishlistItem[];
    totalItemCount: number;
}

export interface IPopulatedWishlistItem {
    course: ICourse;
    _id: mongoose.Types.ObjectId
}

export interface IPopulatedWishlist extends Omit<IWishlist, 'items'> {
    items: IPopulatedWishlistItem[];
}

export interface IWishlistItemResponse {
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

export interface IWishlistResponse {
    _id: string;
    user: string;
    items: IWishlistItemResponse[];
    wishlistItemCount: number;
}
