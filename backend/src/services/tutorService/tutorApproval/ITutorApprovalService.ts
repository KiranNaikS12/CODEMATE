import { ITutor } from "../../../types/tutorTypes";

export interface ITutorApprovalService {
    handleApprovalData(tutorId:string, appprovalData: Partial<ITutor>, file:Express.Multer.File): Promise<ITutor | null >;
    displayTutorDetails(tutorId:string) : Promise<ITutor | null>
}
