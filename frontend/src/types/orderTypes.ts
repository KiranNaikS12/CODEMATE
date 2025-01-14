import { CourseTypes } from "./courseTypes";
import { ApiResponse } from "./types";

export interface PaymentSuccessResponse {
    userId: string,
    orderId: string,
    paymentId: string,
    paymentStatus: string
}

export type showPaymentDetailsResponse = ApiResponse<PaymentSuccessResponse>

export interface IOrderItems {
   course: CourseTypes,
   _id: string
}

export interface IOrder {
    _id: string;
    user: string;
    items: IOrderItems[];
    orderId: string;
    paymentId?: string;
    paymentGateway: string;
    paymentMethod: string;
    paymentStatus: 'Success' | 'Failed' | 'Pending'
    billTotal: number;
    platFormfee: number
    createdAt: string
}

export type showOrderDetailsResponse = ApiResponse<{
    orders: IOrder[];
    totalPagesCount: number;
}>;

export interface FilteredDataForHistory {
    page?: number,
    limit?: number 
}

export type showEnrolledCourseResponse = ApiResponse<IOrder[]>