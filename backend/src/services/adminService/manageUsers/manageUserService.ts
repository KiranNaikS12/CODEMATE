import { IAuthRepository } from '../../../repositories/auth/IAuthRepository';
import { injectable, inject } from 'inversify';
import { AuthMessages } from '../../../utils/message';
import { HttpStatusCode } from '../../../utils/httpStatusCode';
import { CustomError } from '../../../utils/customError';
import { IUserRepository } from '../../../repositories/user/IUserRepository';
import { IUser } from '../../../types/userTypes';
import { IMangeUserService } from './IManageUsersService';
import { FilterOptions } from '../../../types/courseTypes';


@injectable()
export class ManageUserService implements IMangeUserService {
    constructor (
        @inject('AuthRepository') private  AuthRepository: IAuthRepository,
        @inject('UserRepository') private UserRepository: IUserRepository
    ) {}

    async listUsers(filters: FilterOptions, page: number, limit: number): Promise<{users: IUser[], totalUsers: number }> {
        const result = await this.AuthRepository.findByUsers(filters, page, limit);
        
        if(!result.users || result.users.length < 1){
            return { users: [], totalUsers: 0 }
        }  
        
        return result;
    }

    async updateUsers(id:string, isBlocked: boolean): Promise<IUser> {
       const user = await this.AuthRepository.update(id, {isBlocked})
       if(!user){
         throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
       }

       return user;
    }

    async displayUserDetail(userId: string) : Promise<IUser> {
        const userDetail = await this.UserRepository.findById(userId)
        if(!userDetail) {
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }
        return userDetail;
    }
}

