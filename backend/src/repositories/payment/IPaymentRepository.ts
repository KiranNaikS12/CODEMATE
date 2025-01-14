import { IBaseRepository } from "../base/IBaseRepository";
import { IOrder, IPopulatedOrder } from '../../types/orderTypes'

type IOrderPlain = Omit<IOrder, keyof Document>;

export interface IPaymentRepository extends IBaseRepository<IOrder> {
    listUserOrders(userId: string, page: number, limit: number): Promise<{orders: IOrderPlain[]; totalPagesCount: number}>;
    listOrders(userId:string): Promise<IPopulatedOrder[]>
    findOrdersByCourseId(courseId: string) : Promise<IOrder[]>
}
