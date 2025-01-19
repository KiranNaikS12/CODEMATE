import mongoose from "mongoose";
import { injectable, inject } from "inversify";
import { AuthMessages } from "../../utils/message";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { CustomError } from "../../utils/customError";
import { ICartRepository } from "../../repositories/cart/ICartRepository";
import { ICart, ICartItem, ICartResponse, IPopulatedCart } from "../../types/cartTypes";
import { ICourseRepository } from "../../repositories/course/ICourseRepository";
import { IPaymentRepository } from "../../repositories/payment/IPaymentRepository";
import { ICartService } from "./ICartService";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { getSignedUrl } from "../../config/s3";
import { ICourse } from "../../types/courseTypes";


@injectable()
export class CartService implements ICartService {
    constructor(
        @inject('CartRepository') private CartRepository: ICartRepository,
        @inject('CourseRepository') private CourseRepository: ICourseRepository,
        @inject('PaymentRepository') private PaymentRepository: IPaymentRepository,
        @inject('UserRepository') private UserRepository: IUserRepository
        
    ) {}

    async addToCart(userId:string, courseId:string) : Promise<ICart | null> {
        if(!userId || !courseId) {
            throw new CustomError(AuthMessages.COURSE_AND_USER_ID_MISSING, HttpStatusCode.BAD_REQUEST)
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const course = await this.CourseRepository.findById(courseId);
        if(!course){
            throw new CustomError(AuthMessages.COURSE_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }

        let cart = await this.CartRepository.findByWithCart(userId);

        if(!cart) {
            cart = await this.CartRepository.create({
                user:userObjectId,
                items:[],
                cartTotal:0,
                cartItemCount: 0,
            })
        }

        const existingCourseItem = cart.items.find(item => item.course._id.toString() === courseId);
        if(existingCourseItem) {
            throw new CustomError(AuthMessages.COURSE_EXISTS_IN_CART, HttpStatusCode.CONFLICT)
        }

        const order = await this.PaymentRepository.findOne({
            items: {
                $elemMatch: {course: courseId, user: userId}
            }
        });

        if(order) {
            throw new CustomError(AuthMessages.COURSE_ALREDAY_PURCHASED, HttpStatusCode.CONFLICT)
        }

        const cartItem: ICartItem = {
            course: course._id,
            price: course.price - (course.price * course.discount / 100),  
        };

        cart.items.push(cartItem);
        cart.cartTotal += course.price - (course.price * course.discount / 100)
        cart.cartItemCount += 1;

        const updateCart = await this.CartRepository.update(cart._id.toString(), cart);
        return updateCart;
    }

    async listCartItems (userId:string) : Promise<ICartResponse | Partial<ICart>> {
        if(!userId) {
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        };
        const user = await this.UserRepository.findById(userId);
        if(!user) {
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }
        const cart = await this.CartRepository.listCartItems(userId) as IPopulatedCart | null;
        if(!cart) {
            return {
                user: new mongoose.Types.ObjectId(userId),
                items:[],
                cartTotal: 0,
                cartItemCount: 0,
            } 
        }

        const itemsWithSignedUrls = await Promise.all(cart.items.map(async (item) => {
            const populatedCourse = item.course as ICourse;
    
            return {
                _id: item._id.toString(), 
                course: {
                    _id: populatedCourse._id.toString(),
                    title: populatedCourse.title,
                    coverImage: await getSignedUrl(
                        process.env.S3_BUCKET_NAME!,
                        populatedCourse.coverImage
                    ),
                    tutorName: populatedCourse.tutorName,
                    language: populatedCourse.language,
                    subject: populatedCourse.subject,
                    category: populatedCourse.category,
                    price: populatedCourse.price,
                    discount: populatedCourse.discount
                }
            };
        }));
    
        return {
            _id: cart._id.toString(),
            user: cart.user.toString(),
            items: itemsWithSignedUrls,
            cartTotal: cart.cartTotal,
            cartItemCount: cart.cartItemCount
        };
    }
    

    async removeCartItems(userId:string, itemId: string) : Promise<ICart | null> {
        if(!userId || !itemId) {
            throw new CustomError(AuthMessages.USERID_ITEMID_MISSING, HttpStatusCode.NOT_FOUND)
        }
        const cart = await this.CartRepository.findByWithCart(userId);
        if(!cart) {
            throw new CustomError(AuthMessages.CART_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }        
        
        const itemIndex = cart.items.findIndex(item => item._id!.toString() === itemId!.toString())
        if(itemIndex === -1)  {
            throw new CustomError(AuthMessages.CART_IS_EMPTY, HttpStatusCode.NOT_FOUND)
        }

        console.log('itemIndex', itemIndex)

        const removedItem = cart.items[itemIndex];
        cart.items.splice(itemIndex, 1);
        cart.cartTotal -= removedItem.price;
        cart.cartItemCount -= 1;
        
        return await this.CartRepository.update(cart._id.toString(), cart);   
    }
}