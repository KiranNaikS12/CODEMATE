import { Request, Response } from 'express';
import { IAuthRepository } from '../../../repositories/auth/IAuthRepository';
import generateToken from '../../../utils/generateToken';
import { AuthMessages } from '../../../utils/message';
import { injectable, inject } from 'inversify';
import { AdminDashStats, IAdminAuth, Role } from '../../../types/commonTypes';
import { CustomError } from '../../../utils/customError';

import { HttpStatusCode } from '../../../utils/httpStatusCode';
import { IProblemRepository } from '../../../repositories/problems/IProblemRepository';
import { ICourseRepository } from '../../../repositories/course/ICourseRepository';
import { ITokenBlacklistService } from '../../tokenService/ITokenBlacklistService';
import { IAuthAdminService } from './IAuthAdminService';




@injectable()
export class AuthAdminService implements IAuthAdminService {
    constructor (
        @inject('AuthRepository') private AuthRepository: IAuthRepository,
        @inject('TokenBlacklistService') private tokenBlacklistService: ITokenBlacklistService,
        @inject('ProblemRepository') private problemRepository: IProblemRepository,
        @inject('CourseRepository') private courseRepository: ICourseRepository,
        
    ) {}

    async loginAdmin(email: string, password: string, req:Request, res:Response) : Promise<IAdminAuth> {
        const adminEmail = process.env.ADMIN_EMAIL_USER;
        const adminPass = process.env.ADMIN_EMAIL_PASS;

        if(!adminEmail || !adminPass) {
            throw new Error(AuthMessages.INVALID_CREDENTIALS)
        }

        if(email === adminEmail && password === adminPass) {

        generateToken(res, adminEmail.toString(), Role.Admin );

        return {
            email: adminEmail,
            roleId: Role.Admin
        }

        } else {
            throw new Error(AuthMessages.INVALID_CREDENTIALS)
        }
    }

    
    async logoutAdmin (req: Request, res: Response) : Promise<void> {
       try{
          const token = req.cookies.jwt_admin;
          if(!token) {
            throw new CustomError(`No valid token found for ${Role.Admin}`, HttpStatusCode.BAD_REQUEST)
         }

         await this.tokenBlacklistService.addToBlacklist(token);

         res.cookie('jwt_admin', '', {
            httpOnly: true,
            expires: new Date(0)
         });
       } catch (error) {
          console.log("error during logout", error)
          throw new CustomError(AuthMessages.LOGOUT_FAILED, HttpStatusCode.BAD_REQUEST)
       }
    }

    async getDashStats () : Promise<AdminDashStats> {
        const userCounts = (await this.AuthRepository.findByUsers({})).length;
        const tutorCounts = (await this.AuthRepository.findByTutors({})).length;
        const {total: problemCounts} = await this.problemRepository.totalProblems();
        const courseCounts = (await this.courseRepository.find({})).length;


        return {
            userCounts,
            tutorCounts,
            problemCounts,
            courseCounts,
        }
    }
}
