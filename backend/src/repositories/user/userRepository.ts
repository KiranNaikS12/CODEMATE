import { Model } from "mongoose";
import { BaseRepository } from "../base/baseRepository";
import { IUser } from "../../types/userTypes";
import { inject, injectable } from "inversify";
import { IUserRepository } from "./IUserRepository";


@injectable()
export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
    constructor(
        @inject('UserModel') protected userModel: Model<IUser>
    ){
        super(userModel)
    }
}