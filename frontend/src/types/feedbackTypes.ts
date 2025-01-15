import { Problem } from "./problemTypes";
import { ApiResponse } from "./types";
import {  UserAdditional } from "./userTypes";


export interface IFeedback {
    _id: string
    user: UserAdditional
    problem:Problem,
    feedback:string;
    createdAt: string;
}

export type ShowProblemFeedbackResponse = ApiResponse<IFeedback[]>