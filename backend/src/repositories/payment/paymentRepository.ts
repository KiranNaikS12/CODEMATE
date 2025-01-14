import { Model, Document } from 'mongoose';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/baseRepository';
import { IOrder, IPopulatedOrder } from '../../types/orderTypes';
import { IPaymentRepository } from './IPaymentRepository';


@injectable()
export class PaymentRepository extends BaseRepository<IOrder> implements IPaymentRepository {
    private orderModel: Model<IOrder & Document>;

    constructor(
        @inject('OrderModel') orderModel: Model<IOrder & Document>,
    ) {
        super(orderModel);
        this.orderModel = orderModel;
    }

    async listUserOrders(userId: string, page: number, limit: number): Promise<{orders: IOrder[]; totalPagesCount: number}> {
        const skip = (page - 1 ) * limit;
        
        const totalOrders = await this.orderModel.countDocuments({user: userId})

        const orders = await this.orderModel
            .find({ user: userId })
            .populate({
                path: 'items.course',
                select: '_id title coverImage tutorName language subject category price discount',
                model: 'Course'
            }).sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .lean(); 

        const totalPagesCount = Math.ceil(totalOrders / limit);

         return { orders: orders as IOrder[], totalPagesCount };
    }

    async listOrders(userId: string): Promise<IPopulatedOrder[]> {
        const orders = await this.orderModel.find({user:userId, paymentStatus: 'Success'})
        .populate({
            path: 'items.course',
            select: '_id title coverImage tutorName language subject category price discount chapters',
            model: 'Course'
        }).sort({createdAt: -1})
        .lean<IPopulatedOrder[]>()
        return orders as IPopulatedOrder[];
    }

    async findOrdersByCourseId(courseId: string) : Promise<IOrder[]> {
        const orders = await this.orderModel.find({'items.course': courseId})
        .populate({
            path:'user',
            model:'User'
        }).lean() ;

        return orders;
    }
}