import { IBaseRepository } from "../base/IBaseRepository";
import { IFeedback } from "../../types/feedbackTypes";

export interface IFeedbackRepository extends IBaseRepository<IFeedback> {
    listProblemFeedback(problemId: string) : Promise<IFeedback[]>;
}