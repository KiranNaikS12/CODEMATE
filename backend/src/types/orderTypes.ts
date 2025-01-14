import mongoose, { Document } from 'mongoose'
import { IChapter, ICourse } from './courseTypes';

export interface IOrderItems {
    course: mongoose.Types.ObjectId;
    _id?: mongoose.Types.ObjectId;
}

export interface IOrder extends Document {
    _id: mongoose.Types.ObjectId;
    cart: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    items: IOrderItems[];
    paymentId?: string;
    paymentGateway: string;
    paymentMethod: string;
    paymentStatus: 'Success' | 'Failed' | 'Pending' ;
    currency: string;
    platFormfee: number;
    billTotal: number;
    gatewayStatus: boolean;
}

export interface IPopulatedOrderItems {
    course: ICourse;
    _id: mongoose.Types.ObjectId
}

export interface IPopulatedOrder extends Omit<IOrder, 'items'> {
    items: IPopulatedOrderItems[];
}

export interface IOrderItemResponse {
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
        chapters: IChapter[];
    };
}

export interface IOrderResponse {
    _id: string;
    user: string;
    items: IOrderItemResponse[];
    paymentId?: string;
    paymentGateway: string;
    paymentMethod: string;
    paymentStatus: 'Success' | 'Failed' | 'Pending';
    currency: string;
    platFormfee: number;
    billTotal: number;
    gatewayStatus: boolean;
}


