import { Container } from "inversify";
import 'reflect-metadata';
import { IAuthRepository } from "../repositories/auth/IAuthRepository";
import { AuthRepository } from "../repositories/auth/AuthRepository";
import {  EmailService } from "../services/adminService/EmailService/emailService";
import { AuthService } from "../services/authService/authService";
import { AuthController } from "../controllers/auth/authController";
import mongoose from "mongoose";
import { Stripe } from 'stripe'
import UserModel from '../models/userModel'
import TutorModel from '../models/tutorModel'
import { AuthAdminService } from "../services/adminService/adminAuth/authAdminService";
import { AdminAuthController } from "../controllers/admin/adminAuthController";
import { ManageUserService } from "../services/adminService/manageUsers/manageUserService";
import { ManageUserController } from "../controllers/admin/manageUserController";
import { ManageTutorService } from "../services/adminService/manageTutors/manageTutorService";
import { ManageTutorController } from "../controllers/admin/manageTutorController";
import { IUser } from "../types/userTypes";
import { ITutor } from "../types/tutorTypes";
import { TutorRepository } from "../repositories/tutor/tutorRepository";
import { TutorApprovalService } from "../services/tutorService/tutorApproval/tutorApprovalService";
import { TutorApprovalController } from "../controllers/tutor/tutorApprovalController";
import { CloudinaryService } from "./cloudinaryConfig";
import { IUserRepository } from "../repositories/user/IUserRepository";
import { UserRepository } from "../repositories/user/userRepository";
import { UserService } from "../services/userService/userService";
import { UserProfileController } from "../controllers/user/userProfileController";
import { tutorService } from "../services/tutorService/profile/tutorService";
import { TutorProfileController } from "../controllers/tutor/tutorProfileController";
import { IProblemRepository } from "../repositories/problems/IProblemRepository";
import { ProblemRepository } from "../repositories/problems/problemRepository";
import { ProblemService } from "../services/problemService/problemService";
import { ProblemController } from "../controllers/problems/problemsController";
import { ProblemTypes } from "../types/problemTypes";
import ProblemModal from "../models/problemModel";
import { TokenBlacklistService } from "../services/tokenService/tokenBlacklist";
import { TYPES } from "../types/redis.config";
import { IRedisConfig } from "../types/redis.config";
import { redisConfig } from "./redisConfig";
import { ICourse } from "../types/courseTypes";
import courseModel from "../models/courseModal";
import { ICourseRepository } from "../repositories/course/ICourseRepository";
import { CourseRepository } from "../repositories/course/courseRepository";
import { CourseService } from "../services/courseService/courseService";
import { CourseController } from "../controllers/course/courseController";
import { HashService } from "../services/passwordService/hashService";
import { ICart } from "../types/cartTypes";
import cartModel from "../models/cartModel";
import { ICartRepository } from "../repositories/cart/ICartRepository";
import { cartRepository } from "../repositories/cart/cartRepository";
import { CartService } from "../services/cartService/cartService";
import { CartController } from "../controllers/cart/cartController";
import { IWishlist } from "../types/wishlistTypes";
import wishlistModel from "../models/wishlistModel";
import { IWishlistRepository } from "../repositories/wishlist/IWishlistRepository";
import { WishlistRepository } from "../repositories/wishlist/wishlistRepository";
import { WishlistService } from "../services/wishlistService/wishlistService";
import { WishlistController } from "../controllers/wishlist/wishlistController";
import { PayementService } from "../services/payementService/paymentService";
import { PaymentController } from "../controllers/paymentController/paymentController";
import stripeConfig from "./stripeConfig";
import { IPaymentRepository } from "../repositories/payment/IPaymentRepository";
import { PaymentRepository } from "../repositories/payment/paymentRepository";
import { IOrder } from "../types/orderTypes";
import orderModel from "../models/orderModel";
import { IWallet } from "../types/walletTypes";
import walletModel from "../models/walletModel";
import { IWalletRepossitory } from "../repositories/wallet/IWalletRepository";
import { WalletRepository } from "../repositories/wallet/walletRepository";
import { WalletService } from "../services/walletService/walletService";
import { WalletController } from "../controllers/wallet/walletController";
import { IProblemReview, IReview } from "../types/reviewTypes";
import reviewModel from "../models/courseReviewModal";

import { ReviewService } from "../services/coureseReviewService/reviewService";
import { ReviewController } from "../controllers/courseReview/reviewController";
import { IFeedback } from "../types/feedbackTypes";
import feedbackModel from "../models/problemFeedbackModel";
import { IFeedbackRepository } from "../repositories/feedback/IFeedbackRepository";
import { FeedbackRepository } from "../repositories/feedback/feedbackRepository";
import { ProblemFeedbackService } from "../services/feedbackService/problemFeedbackService";
import { FeedbackController } from "../controllers/problemFeedback/feedbackController";
import problemReviewModel from "../models/problemReviewModal";
import { ProblemReviewRepository } from "../repositories/reviews/problemReviewRepository";
import { IProblemReviewRepository } from "../repositories/reviews/IProblemReviewRepository";
import { IMessage } from "../types/messageTypes";
import messageModel from "../models/messageModel";
import { IMessageRepository } from "../repositories/message/IMessageRepository";
import { MessageRepository } from "../repositories/message/messageRepository";
import { MessageService } from "../services/messageService/messageService";
import { SocketServiceClass } from "./socket";
import http from "http";
import {  server } from '../config/socket'
import { ManageEnrolledUser } from "../services/tutorService/ManageUsers/mangeUserService";
import { ManageEnrolledUserController } from "../controllers/tutor/manageUserController";
import { IWishlistservice } from "../services/wishlistService/IWishlistService";
import { IWalletService } from "../services/walletService/IWalletService";
import { IUserService } from "../services/userService/IUserService";
import { ITutorService } from "../services/tutorService/profile/ITutorService";
import { IMangeUserService as ITutorRelated } from "../services/tutorService/ManageUsers/IMangeUserService";
import { IMangeUserService as IAdminRelatedUserService } from "../services/adminService/manageUsers/IManageUsersService";
import { IManageutorService as IAdminRelatedTutorService } from "../services/adminService/manageTutors/IMangeTutorService";
import { ICartService } from "../services/cartService/ICartService";
import { IReviewService } from "../services/coureseReviewService/IReviewService";
import { IProblemFeedbackService } from "../services/feedbackService/IProblemFeedbackService";
import { IPayemntService } from "../services/payementService/IPaymentService";
import { IHashService } from "../services/passwordService/IHashService";
import { IEmailService } from "../services/adminService/EmailService/IEmailService";
import { ICourseService } from "../services/courseService/ICourseService";
import { IMessageService } from "../services/messageService/IMessageService";
import { ITokenBlacklistService } from "../services/tokenService/ITokenBlacklistService";
import { IAuthAdminService } from "../services/adminService/adminAuth/IAuthAdminService";
import { IProblemService } from "../services/problemService/IProblemService";
import { ITutorApprovalService } from "../services/tutorService/tutorApproval/ITutorApprovalService";
import { IAuthService } from "../services/authService/IAuthService";
import { IReviewRepository } from "../repositories/reviews/IReviewRepository";
import { ReviewRepository } from "../repositories/reviews/reviewRepository";



const container = new Container();
//binding

//stripe
container.bind<Stripe>('StripeClient').toConstantValue(stripeConfig);
container.bind<http.Server>('HttpServer').toConstantValue(server);

//Mogoose Model
container.bind<mongoose.Model<IUser>>('UserModel').toConstantValue(UserModel);
container.bind<mongoose.Model<ITutor>>('TutorModel').toConstantValue(TutorModel);
container.bind<mongoose.Model<ProblemTypes>>('ProblemModel').toConstantValue(ProblemModal);
container.bind<mongoose.Model<ICourse>>('CourseModel').toConstantValue(courseModel);
container.bind<mongoose.Model<ICart>>('CartModel').toConstantValue(cartModel);
container.bind<mongoose.Model<IWishlist>>('WishlistModel').toConstantValue(wishlistModel);
container.bind<mongoose.Model<IOrder>>('OrderModel').toConstantValue(orderModel);
container.bind<mongoose.Model<IWallet>>('WalletModel').toConstantValue(walletModel);
container.bind<mongoose.Model<IReview>>('ReviewModel').toConstantValue(reviewModel);
container.bind<mongoose.Model<IFeedback>>('FeedbackModel').toConstantValue(feedbackModel);
container.bind<mongoose.Model<IProblemReview>>('ProblemReviewModel').toConstantValue(problemReviewModel);
container.bind<mongoose.Model<IMessage>>('MessageModel').toConstantValue(messageModel);

// Repositories
container.bind<IAuthRepository>('AuthRepository').to(AuthRepository);
container.bind<TutorRepository>('TutorRepository').to(TutorRepository);
container.bind<IUserRepository>('UserRepository').to(UserRepository);
container.bind<IProblemRepository>('ProblemRepository').to(ProblemRepository);
container.bind<ICourseRepository>('CourseRepository').to(CourseRepository);
container.bind<ICartRepository>('CartRepository').to(cartRepository);
container.bind<IWishlistRepository>('WishlistRepository').to(WishlistRepository);
container.bind<IPaymentRepository>('PaymentRepository').to(PaymentRepository);
container.bind<IWalletRepossitory>('WalletRepository').to(WalletRepository);
container.bind<IReviewRepository>('ReviewRepository').to(ReviewRepository);
container.bind<IFeedbackRepository>('FeedbackRepository').to(FeedbackRepository);
container.bind<IProblemReviewRepository>('ProblemReviewRepository').to(ProblemReviewRepository);
container.bind<IMessageRepository>('MessageRepository').to(MessageRepository);

// Services
container.bind<IEmailService>('EmailService').to(EmailService); //DONE
container.bind<IAuthService>('AuthService').to(AuthService);  // DONE
container.bind<IAuthAdminService>('AuthAdminService').to(AuthAdminService) //DONE
container.bind<IAdminRelatedUserService>('ManageUserService').to(ManageUserService)  //DONE
container.bind<IAdminRelatedTutorService>('ManageTutorService').to(ManageTutorService) //DONE
container.bind<ITutorApprovalService>('TutorApprovalService').to(TutorApprovalService) //DONE
container.bind<CloudinaryService>('CloudinaryService').to(CloudinaryService); //2 
container.bind<IUserService>('UserService').to(UserService);  //DONE
container.bind<ITutorService>('TutorService').to(tutorService); //DONE
container.bind<IProblemService>('ProblemService').to(ProblemService) //DONE
container.bind<IRedisConfig>(TYPES.RedisConfig).toConstantValue(redisConfig) //DONE
container.bind<ITokenBlacklistService>('TokenBlacklistService').to(TokenBlacklistService); //DONE
container.bind<ICourseService>('CourseService').to(CourseService); //DONE
container.bind<IHashService>('HashService').to(HashService); //DONE
container.bind<ICartService>('CartService').to(CartService); //DONE
container.bind<IWishlistservice>('WishlistService').to(WishlistService); //DONE
container.bind<IPayemntService>('PayementService').to(PayementService); //DONE
container.bind<IWalletService>('WalletService').to(WalletService); //DONE
container.bind<IReviewService>('ReviewService').to(ReviewService);  //DONE
container.bind<IProblemFeedbackService> ('ProblemFeedbackService').to(ProblemFeedbackService); //DONE
container.bind<IMessageService>("MessageService").to(MessageService); //DONE
container.bind<SocketServiceClass>('SocketService').to(SocketServiceClass);
container.bind<ITutorRelated>('ManageEnrolledUser').to(ManageEnrolledUser) //DONE

// Controllers
container.bind<AuthController>('AuthController').to(AuthController);
container.bind<AdminAuthController>('AdminAuthController').to(AdminAuthController);
container.bind<ManageUserController>('ManageUserController').to(ManageUserController);
container.bind<ManageTutorController>('ManageTutorController').to(ManageTutorController);
container.bind<TutorApprovalController>('TutorApprovalController').to(TutorApprovalController);
container.bind<UserProfileController>('UserProfileController').to(UserProfileController);
container.bind<TutorProfileController>('TutorProfileController').to(TutorProfileController);
container.bind<ProblemController>('ProblemController').to(ProblemController);
container.bind<CourseController>('CourseController').to(CourseController);
container.bind<CartController>('CartController').to(CartController);
container.bind<WishlistController>('WishlistController').to(WishlistController);
container.bind<PaymentController>('PaymentController').to(PaymentController);
container.bind<WalletController>('WalletController').to(WalletController);
container.bind<ReviewController>('ReviewController').to(ReviewController);
container.bind<FeedbackController>('FeedbackController').to(FeedbackController);
container.bind<ManageEnrolledUserController>('ManageEnrolledUserController').to(ManageEnrolledUserController);


export { container };
