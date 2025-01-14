import { Request, Response} from 'express';
import { injectable, inject } from 'inversify';
import { AuthMessages } from '../../utils/message';
import { HttpStatusCode } from '../../utils/httpStatusCode';
import { formatResponse } from '../../utils/responseFormatter';
import { handleErrorResponse } from '../../utils/HandleErrorResponse';
import { CustomError } from '../../utils/customError';
import { ITutorService } from '../../services/tutorService/profile/ITutorService';

@injectable()
export class TutorProfileController{
    constructor(
        @inject('TutorService') private TutorService: ITutorService
    ) {}


    async displayTutorDetails(req:Request, res:Response): Promise<void> {
      try { 
          const {id} = req.params;
          const tutor = await this.TutorService.displayTutorDetails(id);
          res.status(HttpStatusCode.Ok).json(formatResponse(tutor, AuthMessages.TUTORS_LISTED_SUCCESSFULLY))
      } catch(error) {
        handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
      }
    }

    async updateTutorProfileDetails(req:Request, res:Response): Promise<void> {
      try {
          const { id } = req.params;
          const { tutorData } = req.body;
          const updatedDetails = await this.TutorService.updateTutorProfile(id, tutorData);
          res.status(HttpStatusCode.CREATED).json(formatResponse(updatedDetails, AuthMessages.PROFILE_UPLOADED_SUCCESSFULLY))
      } catch (error) {
         handleErrorResponse(res, error, HttpStatusCode. INTERNAL_SERVER_ERROR)
      }
    }
    

    async updateTutorImage(req:Request, res:Response) : Promise<void> {
      try {
        const {id} = req.params;
        const file = req.file;
        if(!file){
          throw new CustomError(AuthMessages.IMAGE_FILE_DOESNOT_EXISTS, HttpStatusCode.BAD_REQUEST)
        }
        const updatedTutor = await this.TutorService.updateTutorImage(id, file);
        res.status(HttpStatusCode.CREATED).json(formatResponse(updatedTutor,AuthMessages.PROFILE_UPLOADED_SUCCESSFULLY))
      } catch (error) {
        handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
      }
    }

}
