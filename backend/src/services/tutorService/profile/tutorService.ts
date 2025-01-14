import { injectable, inject } from "inversify";
import { ITutorRepository } from "../../../repositories/tutor/ITutorRepository";
import { ITutor } from "../../../types/tutorTypes";
import { CloudinaryService } from "../../../config/cloudinaryConfig";
import { HttpStatusCode } from "../../../utils/httpStatusCode";
import { AuthMessages } from "../../../utils/message";
import { CustomError } from "../../../utils/customError";
import { ITutorService } from "./ITutorService";


@injectable()
export class tutorService implements ITutorService{
    constructor(
        @inject('TutorRepository') private tutorRepository: ITutorRepository,
        @inject('CloudinaryService') private CloudinaryService: CloudinaryService
    ) {}

    async displayTutorDetails(id:string) : Promise<ITutor | null> {
        const tutorData = await this.tutorRepository.findById(id);
        if(!tutorData) {
            throw new CustomError(AuthMessages.NO_TUTOR_FOUND, HttpStatusCode.NOT_FOUND)
        }
        return tutorData;
    }

    async updateTutorProfile(id:string, tutorData:Partial<ITutor>) : Promise<ITutor | null> {
        const updatedTutor = await this.tutorRepository.update(id, tutorData);
        if(!updatedTutor) {
            throw new CustomError(AuthMessages.NO_TUTOR_FOUND, HttpStatusCode.NOT_FOUND)
        }
        return updatedTutor;
    }

    async updateTutorImage(id:string, file:Express.Multer.File) : Promise<ITutor | null> {
        try {
            const imageUrl = await this.CloudinaryService.uploadFile(file, true);
            if(!imageUrl){
                throw new CustomError(AuthMessages.IMAGE_FILE_DOESNOT_EXISTS, HttpStatusCode.BAD_REQUEST)
            }
            const updatedAvatar = await this.tutorRepository.update(id, {profileImage: imageUrl});
            if(!updatedAvatar){
                throw new CustomError(AuthMessages.NO_TUTOR_FOUND, HttpStatusCode.NOT_FOUND)
            }
            return updatedAvatar;
        } catch (error) {
           throw new CustomError(AuthMessages.UPLOAD_FAILED, HttpStatusCode.BAD_REQUEST)
        }
    } 
}