import { Request, Response } from 'express';
import { IAuthRepository } from "../../repositories/auth/IAuthRepository";
import bcrypt from 'bcryptjs';
import { generateOTP } from "../../utils/otpGenerator";
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import generateToken from "../../utils/generateToken";
import { AuthMessages } from "../../utils/message";
import { injectable, inject } from "inversify";
import { BaseUserDetails, DecodeResetPasswordType, Role } from "../../types/commonTypes";
import { CustomError } from '../../utils/customError';
import { HttpStatusCode } from '../../utils/httpStatusCode';
import { IUser } from '../../types/userTypes';
import { ITutor } from '../../types/tutorTypes';
import { isTutor } from '../../types/tutorTypes';
import { getCookieName } from '../../utils/cookieUtils';
import { JwtPayload } from '../../types/utilTypes';
import { IEmailService } from '../adminService/EmailService/IEmailService';
import { ITokenBlacklistService } from '../tokenService/ITokenBlacklistService';
import { IAuthService } from './IAuthService';


@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject('AuthRepository') private AuthRepository: IAuthRepository, 
        @inject('EmailService') private emailService: IEmailService,
        @inject('TokenBlacklistService') private tokenBlacklistServie: ITokenBlacklistService,
    ) { 
        this.tokenBlacklistServie = tokenBlacklistServie
    }

    async initiateRegistration(userDetails: BaseUserDetails, res:Response) : Promise< {token: string}> {
       console.log(userDetails)
       const exisitingUserName = await this.AuthRepository.findByUserName(userDetails.username, userDetails.role);
       if(exisitingUserName) {
         throw new CustomError(AuthMessages.USERNAME_ALREADY_TAKEN, HttpStatusCode.BAD_REQUEST)
       }

       const exisitingUserByEmail = await this.AuthRepository.checkExistingEmail(userDetails.email,userDetails.role);
       if(exisitingUserByEmail) {
         throw new CustomError(AuthMessages.EMAIL_ALREADY_REGISTERED,HttpStatusCode.BAD_REQUEST)
       }
        
        const otp = generateOTP()
        console.log('generated OTP',otp)
        try{
            await this.emailService.sendOTPEmail(userDetails.email, otp);
        }catch( emailError){
            throw new Error(AuthMessages.OTP_NOT_SENT);
        }

        const token = jwt.sign({userDetails,otp}, process.env.JWT_SECRET!, {expiresIn:'2m'})
        return {token};
    }


    async verifyUser(token: string, otp:string, res:Response): Promise<IUser | ITutor> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {userDetails: Partial<IUser | ITutor>, otp:string}

            if(decoded.otp !== otp){
                throw new CustomError(AuthMessages.INVALID_OTP, HttpStatusCode.BAD_REQUEST)
            }
            
            const hashPassword = await bcrypt.hash(decoded.userDetails.password!, 10)
            decoded.userDetails.password = hashPassword;
             
            let newUser: IUser | ITutor | undefined;
            if(decoded.userDetails.roleId === 'user'){
                newUser = await this.AuthRepository.createUser(decoded.userDetails as Partial<IUser>)
            }else if(decoded.userDetails.roleId === 'tutor'){
                newUser = await this.AuthRepository.createTutor(decoded.userDetails as Partial<ITutor>)
            }else {
                throw new CustomError(AuthMessages.INVALID_ROLE, HttpStatusCode.BAD_REQUEST)
            }
            generateToken(res, newUser._id.toString(), newUser.roleId);
            return newUser;

        }catch(error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(AuthMessages.FAILED_TO_VERIFY_USER, HttpStatusCode.UNAUTHORIZED)
        }    
    }


    async googleAuthUser(userDetails: BaseUserDetails, res:Response) : Promise<IUser | ITutor | undefined> {
        const exisitingUser = await this.AuthRepository.findByEmail(userDetails.email);
        console.log("exisitingUser", exisitingUser?.roleId)
        console.log("userDetails", userDetails.role)
        if(exisitingUser) {
            if( exisitingUser.roleId !== userDetails.role) {
                throw new CustomError(AuthMessages.INVALID_ROLE,HttpStatusCode.BAD_REQUEST)
            }
            if(exisitingUser.isBlocked){
                throw new CustomError(AuthMessages.USER_BLOCKED, HttpStatusCode.FORBIDDEN)
            }

            if(exisitingUser.isApproved){
                generateToken(res, exisitingUser._id.toString(), exisitingUser.roleId);
                return exisitingUser;               
            } else {
                throw new CustomError(AuthMessages.USER_IS_NOT_APPROVED, HttpStatusCode.FORBIDDEN)
            }
        } else {
            let newUser;
            if(userDetails.role === 'tutor') {
                newUser = await this.AuthRepository.createTutor({
                    ...userDetails,
                    roleId: userDetails.role,
                    password: await bcrypt.hash(Math.random().toString(36).slice(-8),10)
                })
            }else if(userDetails.role === 'user') {
                newUser = await this.AuthRepository.createUser({
                    ...userDetails,
                    roleId: userDetails.role,
                    password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10)
                })
            }
            if(newUser) {
                generateToken(res, newUser._id.toString(), newUser.roleId);
                return newUser;
            }
        }
       
    }

 
    async loginUser(email: string, password: string, req:Request, res: Response) : Promise<IUser | ITutor> {
        const user = await this.AuthRepository.findByEmail(email);
        if(!user) {
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }

        if(user.isBlocked) {
            throw new CustomError(AuthMessages.USER_BLOCKED, HttpStatusCode.FORBIDDEN)
        }

        if(isTutor(user)){
            if(!user.isApproved){
                throw new CustomError(AuthMessages.USER_IS_NOT_APPROVED, HttpStatusCode.FORBIDDEN)
            }
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            throw new Error(AuthMessages.INVALID_CREDENTIALS)
        }
        if (
            (user.roleId === Role.Tutor && req.originalUrl.includes('/users')) ||
            (user.roleId === Role.User && req.originalUrl.includes('/tutors'))
        ) {
            throw new Error(AuthMessages.INVALID_LOGIN_ROUTE);
        }

        generateToken(res, user._id.toString(), user.roleId);
        return user;
    }


    async forgetPassword(email:string, role:Role) : Promise<void> {
        const userData = await this.AuthRepository.checkRole(email, role);
        if(!userData) {
            throw new CustomError(AuthMessages.USER_WITH_THIS_EMAIL_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }
        if(!email || !role){
            throw new CustomError(AuthMessages.INVALID_ROLE_AND_EMAIL, HttpStatusCode.BAD_REQUEST)
        }
        const token = jwt.sign({email:userData.email, id:userData._id, role}, process.env.JWT_SECRET!, {expiresIn:'2m'})
        const resetLink = `http://localhost:5173/reset-password/${userData._id}/${token}`;
        try {
           await this.emailService.sendPasswordResetEmail(email, resetLink);
        } catch (error) {
           throw new CustomError(AuthMessages.FAILED_TO_SEND_EMAIL, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async validateResetToken(id: string, token:string) : Promise<void> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodeResetPasswordType;
            
            if (decoded.id !== id) {
                throw new CustomError(AuthMessages.INVALID_TOKEN, HttpStatusCode.BAD_REQUEST);
            }
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new CustomError(AuthMessages.RESET_LINK_EXPIRED, HttpStatusCode.UNAUTHORIZED);
            }
            throw new CustomError(AuthMessages.RESET_LINK_EXPIRED, HttpStatusCode.BAD_REQUEST);
        }
    }

    async resetPassword(id:string, token:string, password:string): Promise<void> {
        await this.validateResetToken(id, token)
        
        console.log('inside reset password')
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodeResetPasswordType;
        
        const userData = await this.AuthRepository.checkRole(decoded.email, decoded.role);
        if(!userData){
            throw new CustomError(AuthMessages.USER_NOT_FOUND,HttpStatusCode.NOT_FOUND)
        }
        
        const hashPassword = await bcrypt.hash(password, 10);

        try {
            await this.AuthRepository.update(id, {password:hashPassword});
        } catch (error) {
            if(error instanceof CustomError){
                throw error;
            }
            if (error instanceof TokenExpiredError) {
                throw new CustomError(AuthMessages.RESET_LINK_EXPIRED, HttpStatusCode.UNAUTHORIZED);
            }
            throw new CustomError(AuthMessages.PASSWORD_RESET_FAILED, HttpStatusCode.BAD_REQUEST)
        }
    }


    async logoutUser(req: Request, res: Response) : Promise<void> {
        try {
            const roleFromRoute = req.originalUrl.includes('/tutors') ? Role.Tutor : Role.User;
            const cookieName = getCookieName(roleFromRoute)
            const token = req.cookies[cookieName];
            if(!token) {
               throw new CustomError(`No valid token found for ${roleFromRoute}`, HttpStatusCode.BAD_REQUEST)
            }       
            
            try {
               const decoded  = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
               
               if(decoded.roleId !== roleFromRoute){
                  throw new CustomError(`Invalid token role for this endpoint: expected ${roleFromRoute}, got ${decoded.roleId}`, HttpStatusCode.BAD_REQUEST)
               }


               await this.tokenBlacklistServie.addToBlacklist(token);
               res.cookie(cookieName, '', {
                   httpOnly: true,
                   expires: new Date(0),
                   secure: process.env.NODE_ENV === 'production',
                   sameSite: 'strict'
               });


            }  catch (error) {
                if (error instanceof jwt.JsonWebTokenError) {
                    throw new CustomError(
                        AuthMessages.TOKEN_IS_NOT_VALID, 
                        HttpStatusCode.BAD_REQUEST
                    );
                }
                throw error;
            } 
           
        } catch(error) {
            console.log("error during logout", error)
            throw new CustomError(AuthMessages.LOGOUT_FAILED, HttpStatusCode.BAD_REQUEST)
        }
    }
}