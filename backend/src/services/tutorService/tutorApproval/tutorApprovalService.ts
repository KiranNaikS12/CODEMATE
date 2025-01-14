import { injectable, inject } from "inversify";
import { ITutorRepository } from "../../../repositories/tutor/ITutorRepository";
import { ITutor } from "../../../types/tutorTypes";
import { CloudinaryService } from "../../../config/cloudinaryConfig";
import { HttpStatusCode } from "../../../utils/httpStatusCode";
import { AuthMessages } from "../../../utils/message";
import { CustomError } from "../../../utils/customError";
import { ITutorApprovalService } from "./ITutorApprovalService";


@injectable()
export class TutorApprovalService implements ITutorApprovalService {
    constructor(
        @inject('TutorRepository') private tutorRepository: ITutorRepository,
        @inject('CloudinaryService') private cloudinaryService: CloudinaryService
    ) {}

    async handleApprovalData(tutorId:string, appprovalData: Partial<ITutor>, file:Express.Multer.File): Promise<ITutor | null > {
        let certificateUrl: string | undefined;
        if(file){
            certificateUrl = await this.cloudinaryService.uploadFile(file, false);
        } else {
            throw new CustomError(AuthMessages.FILE_DOESNT_EXISTS_OR_INVALID, HttpStatusCode.BAD_REQUEST)
        }
        const updateApprovalData = {
            ...appprovalData,
            certificate:certificateUrl 
        }

        return await this.tutorRepository.update(tutorId, updateApprovalData);
    }

    async displayTutorDetails(tutorId:string) : Promise<ITutor | null> {
        const tutorData = await this.tutorRepository.findById(tutorId);
        if(!tutorData) {
            throw new CustomError(AuthMessages.NO_TUTOR_FOUND, HttpStatusCode.NOT_FOUND)
        }
        return tutorData;
    }
}