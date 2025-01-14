import { Response, Request } from "express";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { formatResponse } from "../../utils/responseFormatter";
import { handleErrorResponse } from "../../utils/HandleErrorResponse";
import { TutorApprovalService } from "../../services/tutorService/tutorApproval/tutorApprovalService";
import { injectable, inject } from "inversify";
import { CustomError } from "../../utils/customError";
import { AuthMessages } from "../../utils/message";
import { ITutorApprovalService } from "../../services/tutorService/tutorApproval/ITutorApprovalService";

@injectable()
export class TutorApprovalController {
     constructor(
        @inject('TutorApprovalService') private tutorApprovalService: ITutorApprovalService
     ){}

     async handleApprovalData(req:Request, res:Response) {
        try {
           const { tutorId} = req.params;
           const appprovalData = req.body;
           const file = req.file;
           if (!file) {
            throw new CustomError(AuthMessages.FILE_DOESNT_EXISTS_OR_INVALID, HttpStatusCode.BAD_REQUEST);
          }
      
          const updatedTutor = await this.tutorApprovalService.handleApprovalData(tutorId, appprovalData, file);
          
          if (!updatedTutor) {
            throw new CustomError(AuthMessages.NO_TUTOR_FOUND, HttpStatusCode.NOT_FOUND);
          }
           
           res.status(HttpStatusCode.CREATED).json(formatResponse(null, AuthMessages.UPDATED_SUCCESSFULL))
        } catch(error){
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
     }
}