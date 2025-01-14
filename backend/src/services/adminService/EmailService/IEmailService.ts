
export interface IEmailService {
    sendOTPEmail(email: string, otp: string): Promise<void>;
    sendPasswordResetEmail(email: string, resetLink:string): Promise<void>;
    sendApprovalConfirmationMail(email: string, reason: string, isApproved: boolean) : Promise<void>
}
