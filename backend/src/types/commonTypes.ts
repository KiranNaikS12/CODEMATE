import mongoose, { Document } from "mongoose";

export enum Role {
    User = 'user',
    Tutor = 'tutor',
    Admin = 'admin'
}

export interface BaseUserDetails {
    username: string;
    email: string;
    role: Role;
    password: string;
    confirmPassword: string;
}

export interface BaseUser extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    roleId: Role;
    isBlocked: boolean;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface IAdminAuth {
    email: string;
    roleId: Role
}

export interface PaymentStat {
    transactionId?: string;
    amount?: number;
    paymentStatus?: 'Success' | 'Failed' | 'Pending';
    userId?: mongoose.Types.ObjectId;
    orderId?: string;
    paymentId?: string;

}

export interface UserStats {
    totalCourse: number;
    walletBalance: number;
}

export interface AdminDashStats {
    userCounts: number;
    tutorCounts: number;
    problemCounts: number;
    courseCounts: number;
}

export interface DecodeResetPasswordType {
    email: string;
    id: string;
    role: Role;
    iat: number;
    exp: number;
}