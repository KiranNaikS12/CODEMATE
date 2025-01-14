import { ITutor } from "../../../types/tutorTypes";

export interface ITutorService {
    displayTutorDetails(id: string) : Promise<ITutor | null>;
    updateTutorProfile(id: string, tutorData: Partial<ITutor>) : Promise<ITutor | null>;
    updateTutorImage(id: string, file: Express.Multer.File) : Promise<ITutor | null>;  
}