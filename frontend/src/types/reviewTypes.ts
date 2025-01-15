import { CourseTypes } from "./courseTypes";
import { Problem } from "./problemTypes";
import { ApiResponse } from "./types";
import {  UserAdditional } from "./userTypes";

export interface IReview {
    _id: string,
    user: UserAdditional,
    course: CourseTypes,
    ratings: number,
    title: string,
    feedback: string
    createdAt: string
}

export interface IProblemReview {
    _id: string,
    user: UserAdditional,
    problem: Problem,
    ratings: number,
    reviews: string,
    createdAt: string
}

export type showReviewListResponse = ApiResponse<IReview[]>

export type showProblemReviewListResponse = ApiResponse<IProblemReview[]>