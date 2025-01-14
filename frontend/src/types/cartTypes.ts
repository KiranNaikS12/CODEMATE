import { CourseTypes } from "./courseTypes";
import { ApiResponse } from "./types";
import { User } from "./userTypes";

export interface ICartItem {
    course: CourseTypes,
    price: number,
    _id:string
}

export interface ICart  {
    _id:string,
    user:User,
    items: ICartItem[],
    cartTotal: number,
    cartItemCount: number,
}

export type showCartDetailsResponse = ApiResponse<ICart>