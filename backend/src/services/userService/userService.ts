import { injectable, inject } from "inversify";
import { AuthMessages } from "../../utils/message";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { CustomError } from "../../utils/customError";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { IUser } from "../../types/userTypes";
import { CloudinaryService } from "../../config/cloudinaryConfig";
import { IPaymentRepository } from "../../repositories/payment/IPaymentRepository";
import { IWalletRepossitory } from "../../repositories/wallet/IWalletRepository";
import { UserStats } from "../../types/commonTypes";
import { IUserService } from "./IUserService";
import { IHashService } from "../passwordService/IHashService";



@injectable()
export class UserService implements IUserService{
    constructor(
        @inject('UserRepository') private UserRepository: IUserRepository,
        @inject('CloudinaryService') private CloudinaryService: CloudinaryService,
        @inject('PaymentRepository') private PaymentRepository: IPaymentRepository,
        @inject('HashService') private HashService: IHashService,
        @inject('WalletRepository') private WalletRepository: IWalletRepossitory,
    ){}

    async displayUserData(userId: string) : Promise<IUser> {
        if(!userId){
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }
        const userData = await this.UserRepository.findById(userId);
        if(!userData) {
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }
        return userData;
    }

    async updateUserData(id:string, userData: Partial<IUser>) : Promise<IUser> {
       const updatedUser = await this.UserRepository.update(id, userData);
       if(!updatedUser) {
         throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
       }
       return updatedUser;
    }

    async updateUserProfile(id: string, file:Express.Multer.File) : Promise<IUser | null> {
        try {
            const imageUrl = await this.CloudinaryService.uploadFile(file, true);
            if(!imageUrl){
                throw new CustomError(AuthMessages.IMAGE_FILE_DOESNOT_EXISTS, HttpStatusCode.BAD_REQUEST)
            }
            const updatedUserProfile = await this.UserRepository.update(id, {profileImage: imageUrl});
            if(!updatedUserProfile) {
                throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
            }
            return updatedUserProfile;
        } catch (error) {
            throw new CustomError(AuthMessages.UPLOAD_FAILED, HttpStatusCode.BAD_REQUEST)
        }
    }

    async updateAccountData(id: string, userData: Partial<IUser>) : Promise<IUser> {
        console.log('username', userData.username)
        const normalizedUsername = userData?.username?.toLowerCase()
        if(userData.username){
            const exisitingUserWithName = await this.UserRepository.findOne({
                username: {$regex: `^${normalizedUsername}`, $options: "i"}
            });
            if(exisitingUserWithName){
                throw new CustomError(AuthMessages.USERNAME_ALREADY_TAKEN, HttpStatusCode.BAD_REQUEST)
            }
        }
        console.log('email', userData.email)
        if(userData.email){
            const exisitingUserByEmail = await this.UserRepository.findOne({email: userData.email});
            if(exisitingUserByEmail){
                throw new CustomError(AuthMessages.EMAIL_ALREADY_EXISTS, HttpStatusCode.CONFLICT)
            }
        }
        const updatedUser = await this.UserRepository.update(id, userData);
        if(!updatedUser) {
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.CONFLICT)
        }
        return updatedUser;
    }

    async updateUserPassword(id: string, current_password:string, password: string ) : Promise<IUser> {
       const user = await this.UserRepository.findById(id);
       if(!user) {
          throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
       }

       const isPasswordValid = await this.HashService.compare(
         current_password,
         user.password
       );

       if(!isPasswordValid) {
         throw new CustomError(AuthMessages.INVALID_CURRENT_PASSWORD, HttpStatusCode.BAD_REQUEST)
       }

       const hashedNewPassword = await this.HashService.hash(password);

       const updatePassword = await this.UserRepository.update(id, {
        password: hashedNewPassword
       });

       if(!updatePassword) {
          throw new CustomError(AuthMessages.PASSWORD_UPDATE_FAILED, HttpStatusCode.INTERNAL_SERVER_ERROR)
       }

       return updatePassword;
    }

    async getDashboardStats(userId: string) : Promise<UserStats> {
        if(!userId) throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);

        const user = await this.UserRepository.findById(userId);
        if(!user) {
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const enrolledCourseCount = await this.PaymentRepository.listOrders(userId);
        const totalCourse = enrolledCourseCount.length;
        const walletData = await this.WalletRepository.findOne({walletOwner: userId});
        const walletBalance = walletData ? walletData.walletBalance : 0;

        return {
            totalCourse,
            walletBalance
        };
    }

    
}