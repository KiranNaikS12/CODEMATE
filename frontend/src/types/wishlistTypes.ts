import { CourseTypes } from "./courseTypes";
import { ApiResponse } from "./types";
import { User } from "./userTypes";


export interface IWishlistItem {
    course: CourseTypes,
    _id:string
}

export interface IWishlist {
    _id: string;
    user: User;
    items: IWishlistItem[];
    totalItemCount: number;
}

export type showWishlistDetailsResponse = ApiResponse<IWishlist>