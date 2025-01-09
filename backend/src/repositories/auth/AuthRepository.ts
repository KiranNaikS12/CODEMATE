import { Model, Document } from 'mongoose';
import { IAuthRepository } from './IAuthRepository';
import { BaseRepository } from '../base/baseRepository';
import { Role } from '../../types/commonTypes';
import { IUser } from '../../types/userTypes';
import { ITutor } from '../../types/tutorTypes';
import { inject, injectable } from 'inversify';


@injectable()
export class AuthRepository extends BaseRepository<IUser | ITutor> implements IAuthRepository {
    private userModel: Model<IUser & Document>;
    private tutorModel: Model<ITutor & Document>;

    constructor(
        @inject('UserModel') userModel: Model<IUser & Document>,
        @inject('TutorModel') tutorModel: Model<ITutor & Document>
    ) {
        super(userModel);
        this.userModel = userModel;
        this.tutorModel = tutorModel;
    }

    async findByEmail(email: string): Promise<IUser | ITutor | null> {
        const user = await this.userModel.findOne({ email }).exec();
        return user || this.tutorModel.findOne({ email }).exec();
    }

    async checkExistingEmail(email: string, roleId: Role): Promise<IUser | ITutor | null> {
        if(roleId === Role.User) {
            return await this.userModel.findOne({email}).exec();
        }else if(roleId === Role.Tutor) {
            return await this.tutorModel.findOne({email}).exec();
        }
        return null;
    }

    async findByUserName(username: string, roleId:Role): Promise<IUser | ITutor | null> {
        if(roleId === Role.User) {
           return await this.userModel.findOne({username}).exec();
           
        } else if(roleId === Role.Tutor) {
           return await this.tutorModel.findOne({username}).exec();
        }
        return null;
    }

    async findByUsers(filter: any = {}): Promise<IUser[]> {
        return this.userModel.find(filter).sort({ createdAt: -1 }).exec();
    }

    async findByTutors(filter: any = {}): Promise<ITutor[]> {
        return this.tutorModel.find(filter).sort({ createdAt: -1 }).exec();
    }

    async checkRole(email: string, roleId: Role): Promise<IUser | ITutor | null> {
        const model = roleId === Role.Tutor ? this.tutorModel : this.userModel;
        return (model as Model<IUser & Document>).findOne({email, roleId}).exec();
    }

    async createUser(userDetails: Partial<IUser>): Promise<IUser> {
        const user = new this.userModel(userDetails);
        return user.save();
    }

    async createTutor(userDetails: Partial<ITutor>): Promise<ITutor> {
        const tutor = new this.tutorModel(userDetails);
        return tutor.save();
    }

    async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
        return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async updateTutor(id: string, data: Partial<ITutor>): Promise<ITutor | null> {
        return this.tutorModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }
}