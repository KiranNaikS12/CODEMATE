import { injectable, inject } from "inversify";
import { ICourseRepository } from "../../../repositories/course/ICourseRepository";
import { CustomError } from "../../../utils/customError";
import { AuthMessages } from "../../../utils/message";
import { HttpStatusCode } from "../../../utils/httpStatusCode";
import { IPaymentRepository } from "../../../repositories/payment/IPaymentRepository";
import { IUser } from "../../../types/userTypes";
import { IMangeUserService } from "./IMangeUserService";
import { IOrder } from "../../../types/orderTypes";


@injectable()
export class ManageEnrolledUser implements IMangeUserService {
    constructor(
        @inject('CourseRepository') private CourseRepository: ICourseRepository,
        @inject('PaymentRepository') private PaymentRepository: IPaymentRepository
    ){}

    async listEnrolledUser(tutorId: string) : Promise<IUser[]> {
        if(!tutorId) throw new CustomError(AuthMessages.NO_TUTOR_FOUND, HttpStatusCode.NOT_FOUND);

        const courses = await this.CourseRepository.find({tutorId: tutorId});
        const courseIds = courses.map(course => course._id);

        const allUsers: any[] =  [];
        for(const courseId of courseIds) {
            const orders: IOrder[]  = await this.PaymentRepository.findOrdersByCourseId(courseId.toString())
            orders.forEach(order => {
                if (order.user ) {
                    allUsers.push(order.user); 
                }
            });
        }
        
        const uniqueUsers = allUsers.filter(
            (user: IUser, index: number, self: IUser[]) => 
                index === self.findIndex(u => u._id.toString() === user._id.toString())
        )
        return uniqueUsers;
    }
}