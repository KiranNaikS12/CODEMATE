import mongoose, { Document } from 'mongoose';

export interface IReview extends Document {
    _id: mongoose.Types.ObjectId,
    user: mongoose.Types.ObjectId,
    course: mongoose.Types.ObjectId,
    ratings: number,
    title: string,
    feedback: string
}

export interface IProblemReview extends Document {
    _id: mongoose.Types.ObjectId,
    user: mongoose.Types.ObjectId,
    problem: mongoose.Types.ObjectId,
    ratings: number,
    reviews: string
}