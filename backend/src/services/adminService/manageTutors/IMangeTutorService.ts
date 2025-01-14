import { FilterOptions } from "../../../types/courseTypes";
import { ITutor } from "../../../types/tutorTypes";

export interface IManageutorService {
    listTutors(filters:FilterOptions): Promise<ITutor[]>;
    updateTutors(id:string, isBlocked:boolean) : Promise<ITutor>;
    displayTutorDetails(tutorId:string): Promise<ITutor>;
    updateTutorApproval( tutorId:string, isApproved:boolean, isVerified:boolean, reason?: string) : Promise<ITutor>
}
