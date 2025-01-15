import { IFeedback } from "../../types/feedbackTypes";

export interface IProblemFeedbackService {
    addProblemFeedback(userId: string, problemId: string, feedback: string) : Promise<IFeedback | null>;
    listProblemFeedback(problemId: string) : Promise<Partial<IFeedback[]>>;
    
}