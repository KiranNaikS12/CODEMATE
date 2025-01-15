import { inject, injectable } from "inversify";
import { UserRepository } from "../../repositories/user/userRepository";
import { ProblemRepository } from "../../repositories/problems/problemRepository";
import { IFeedback } from "../../types/feedbackTypes";
import { CustomError } from "../../utils/customError";
import { AuthMessages } from "../../utils/message";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { FeedbackRepository } from "../../repositories/feedback/feedbackRepository";
import { IProblemFeedbackService } from "./IProblemFeedbackService";

@injectable()
export class ProblemFeedbackService implements IProblemFeedbackService{
    constructor (
        @inject('UserRepository') private UserRepository : UserRepository,
        @inject('ProblemRepository') private ProblemRepository: ProblemRepository,
        @inject('FeedbackRepository') private FeedBackRepository: FeedbackRepository
    ) {}

    async addProblemFeedback (userId: string, problemId: string, feedback: string) : Promise<IFeedback | null> {
        const [user, problem] = await Promise.all([
            this.UserRepository.findById(userId),
            this.ProblemRepository.findOne({_id: problemId})
        ]);

        if(!user) throw new CustomError(AuthMessages.USER_NOT_FOUND,HttpStatusCode.NOT_FOUND);
        if(!problem) throw new CustomError(AuthMessages.PROBLEM_NOT_FOUND, HttpStatusCode.NOT_FOUND);

        const feedData = {
            user: user._id,
            problem: problem._id,
            feedback: feedback
        };
        
        const feed = await this.FeedBackRepository.create(feedData);

        return feed;
    }

    async listProblemFeedback(problemId: string) : Promise<Partial<IFeedback[]>> {
        const feed = await this.FeedBackRepository.listProblemFeedback(problemId);
        if(!feed){
            throw new CustomError(AuthMessages.NO_FEEDBACK_MESSAGE_FOUND, HttpStatusCode.NOT_FOUND);
        }

        return feed;
    }
}