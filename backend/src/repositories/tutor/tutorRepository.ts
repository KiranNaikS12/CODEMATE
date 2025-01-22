import { Model, Document } from "mongoose";
import { BaseRepository } from "../base/baseRepository";
import { ITutor } from "../../types/tutorTypes";
import {inject, injectable} from 'inversify';
import { ITutorRepository } from "./ITutorRepository";



@injectable()
export class TutorRepository extends BaseRepository<ITutor> implements ITutorRepository{
    constructor(
       @inject('TutorModel') private tutorModel: Model<ITutor & Document>
    ){
        super(tutorModel)
    }

    

}