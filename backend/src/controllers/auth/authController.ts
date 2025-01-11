import { Request, Response } from "express";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { AuthMessages } from "../../utils/message";
import { formatResponse } from "../../utils/responseFormatter";
import { mapGoogleAuthUserResponse, mapUserResponse } from "../../utils/responseMapper";
import { inject, injectable } from "inversify";
import { Role } from "../../types/commonTypes";
import { IUser } from "../../types/userTypes";
import { ITutor } from "../../types/tutorTypes";
import { handleErrorResponse } from "../../utils/HandleErrorResponse";
import { CustomError } from "../../utils/customError";
import { IAuthService } from "../../services/authService/IAuthService";


@injectable()
export class AuthController  {
    constructor(@inject('AuthService')private authService: IAuthService) {}

    async initiateRegistration(req:Request, res:Response): Promise<void> {
        try{
            const {token} = await this.authService.initiateRegistration(req.body, res);
            res.status(HttpStatusCode.Ok).json(formatResponse({token}, AuthMessages.OTP_SENT_SUCCESS))
        }catch(error){
            handleErrorResponse(res, error)
        }
    }

    async verifyUser(req: Request, res: Response): Promise<void> {
        try {    
          const { token, otp } = req.body;
          if (!token || !otp) {
            res.status(400).json(formatResponse(null, 'Token and OTP are required', false));
            return;
          }

          const newUser = await this.authService.verifyUser(token, otp, res);
          res.status(HttpStatusCode.CREATED).json(formatResponse(mapUserResponse(newUser), AuthMessages.USER_REGISTERED_SUCCESS));
        } catch (error) {
          handleErrorResponse(res, error, HttpStatusCode.BAD_REQUEST);
        }
    }

    async googleAuthUser(req:Request, res:Response): Promise<void> {
        try {
            const user = await this.authService.googleAuthUser(req.body, res);
            if(!user) {
                throw new CustomError(AuthMessages.UNATHERIZED_USER, HttpStatusCode.FORBIDDEN)
            }
            res.status(HttpStatusCode.Ok).json(formatResponse(mapGoogleAuthUserResponse(user), AuthMessages.LOGIN_SUCCESSFUL));
        } catch(error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }


    async loginUser(req:Request, res:Response) : Promise<void> {
        try{
            const {email, password} = req.body;
            const user: IUser | ITutor = await this.authService.loginUser(email, password,req, res);
            res.status(HttpStatusCode.Ok).json(formatResponse(mapUserResponse(user), AuthMessages.LOGIN_SUCCESSFUL))
        }catch(error){
            handleErrorResponse(res, error, HttpStatusCode.BAD_REQUEST)
        }
    }


    async logoutUser(req: Request, res: Response) : Promise<void> {
        try{
            await this.authService.logoutUser(req,res)
            res.status(HttpStatusCode.Ok).json(formatResponse(null,AuthMessages.USER_LOGOUT))
        }catch(error){
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async forgetPassword(req:Request, res:Response): Promise<void> {
        try {
            const {email, role} = req.body;
            await this.authService.forgetPassword(email, role as Role);
            res.status(HttpStatusCode.Ok).json(formatResponse(null, AuthMessages.RESET_LINK_SENT))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
        
    }

    async validateResetToken(req:Request, res:Response) : Promise<void> {
        try{
            const { id, token } = req.params;
            await this.authService.validateResetToken(id, token);
            res.status(HttpStatusCode.Ok).json(formatResponse(null, AuthMessages.VALID_TOKEN));
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.BAD_REQUEST);
        }
    }

    async resetPassword(req:Request, res:Response) : Promise<void> {
        try {
            const {id, token}= req.params;
            const {password} = req.body;
            const result = await this.authService.resetPassword(id, token, password)
            res.status(HttpStatusCode.Ok).json(formatResponse(result, AuthMessages.PASSOWRD_RESET_SUCCESSFULL))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

}