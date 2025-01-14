import { injectable, inject } from "inversify";
import { IAuthRepository } from "../../../repositories/auth/IAuthRepository";
import { CustomError } from "../../../utils/customError";
import { HttpStatusCode } from "../../../utils/httpStatusCode";
import { AuthMessages } from "../../../utils/message";
import { ITutorRepository } from "../../../repositories/tutor/ITutorRepository";
import { IEmailService } from "../EmailService/IEmailService";
import { ITutor } from "../../../types/tutorTypes";
import { IManageutorService } from "./IMangeTutorService";
import { FilterOptions } from "../../../types/courseTypes";


@injectable()
export class ManageTutorService implements IManageutorService {
    constructor(
        @inject('AuthRepository') private AuthRepository: IAuthRepository,
        @inject('TutorRepository') private TutorRepository: ITutorRepository,
        @inject('EmailService') private EmailService: IEmailService
    ){}

    async listTutors(filters: FilterOptions): Promise<ITutor[]> {
        const tutor = await this.AuthRepository.findByTutors(filters);
        if(!tutor || tutor.length < 1) {
            return [];
        }
        return tutor;
    }

    async updateTutors(id:string, isBlocked:boolean) : Promise<ITutor> {
        const tutor = await this.AuthRepository.updateTutor(id, {isBlocked});
        if(!tutor) {
            throw new CustomError(AuthMessages.NO_TUTOR_FOUND, HttpStatusCode.NOT_FOUND)
        }
        return tutor;
    }

    async displayTutorDetails(tutorId:string): Promise<ITutor> {
        const tutorDetail = await this.TutorRepository.findById(tutorId);
        if(!tutorDetail){
            throw new CustomError(AuthMessages.NO_TUTOR_FOUND,HttpStatusCode.NOT_FOUND)
        }
        return tutorDetail;
    }

    async updateTutorApproval( tutorId:string, isApproved:boolean, isVerified:boolean, reason?: string) : Promise<ITutor> {
        const udpatedTutor = await this.AuthRepository.updateTutor(tutorId, {isApproved,isVerified});
        if(!udpatedTutor){
            throw new CustomError(AuthMessages.NO_TUTOR_FOUND, HttpStatusCode.BAD_REQUEST)
        }

        await this.EmailService.sendApprovalConfirmationMail(udpatedTutor.email, reason || '', isApproved)

        return udpatedTutor;
    }
}