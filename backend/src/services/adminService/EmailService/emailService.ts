import { injectable } from 'inversify';
import nodemailer from 'nodemailer';
import { CustomError } from '../../../utils/customError';
import { AuthMessages } from '../../../utils/message';
import { HttpStatusCode } from '../../../utils/httpStatusCode';
import { IEmailService } from './IEmailService';



@injectable()
export class EmailService implements IEmailService {
    private transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN_EMAIL_USER,
            pass: process.env.ADMIN_EMAIL_PASS,
        },
    });

    async sendOTPEmail(email: string, otp: string): Promise<void> {
        const mailOptions = {
            from: process.env.ADMIN_EMAIL_USER,
            to: email,
            subject: 'Your OTP for verification',
            text: `Your OTP is: ${otp}`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            throw new CustomError(AuthMessages.FAILED_TO_SEND_EMAIL,HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
        const mailOptions = {
            from: process.env.ADMIN_EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            text: `Click the following link to reset your password: ${resetLink}\n\nThis link will expire within 5 minutes. Please do not share your link with others.`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background-color: #f9f9f9;
                            border-radius: 5px;
                            padding: 30px;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            color: #2c3e50;
                            margin-bottom: 20px;
                        }
                        .btn {
                            display: inline-block;
                            background-color: #3498db;
                            color: #ffffff !important;
                            text-decoration: none;
                            padding: 12px 25px;
                            border-radius: 5px;
                            font-weight: bold;
                            margin: 20px 0;
                        }
                        .warning {
                            background-color: #fff3cd;
                            border: 1px solid #ffeeba;
                            border-radius: 5px;
                            padding: 10px;
                            margin-top: 20px;
                            font-size: 0.9em;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Password Reset Request</h1>
                        <p>Hello,</p>
                        <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
                        <p>To reset your password, click the button below:</p>
                        <a href="${resetLink}" class="btn">Reset Password</a>
                        <div class="warning">
                            <p><strong>Important:</strong></p>
                            <ul>
                                <li>This link will expire in 2 minutes.</li>
                                <li>For security reasons, please do not share this link with anyone.</li>
                            </ul>
                        </div>
                        <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
                        <p>${resetLink}</p>
                        <p>Best regards,<br>CodeMATE</p>
                    </div>
                </body>
                </html>
            `
        };
        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            throw new CustomError(AuthMessages.FAILED_TO_SEND_EMAIL, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async sendApprovalConfirmationMail(email: string, reason:string, isApproved: boolean) : Promise<void> {
        const subject = isApproved ? 'Tutor Approval Request Accepted' : 'Tutor Approval Request Status';
    const title = isApproved ? 'Congratulations!' : 'Application Status Update';
    const message = isApproved
        ? 'Your tutor approval request has been approved.'
        : `We regret to inform you that your tutor approval request has been rejected.<br>Reason: \n\n${reason}`;

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .logo { text-align: center; margin-bottom: 20px; }
                .logo img { max-width: 150px; }
                .content { background-color: #f9f9f9; border-radius: 5px; padding: 20px; text-align:center;   box-shadow: 0 2px 4px rgba(0,0,0,0.1);}
                h1 { color: ${isApproved ? '#28a745' : '#dc3545'}; }
                .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <img src="https://your-website.com/logo.png" alt="Your Logo">
                </div>
                <div class="content">
                    <h1>${title}</h1>
                    <p>${message}</p>
                    <p>If you have any further questions, please don't hesitate to contact us.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} @CodeMATE. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

        const mailOptions = {
            from: process.env.ADMIN_EMAIL_USER,
            to: email,
            subject: 'Tutro Approval Request',
            text:message,
            html: htmlContent
        }

        try {
           await this.transporter.sendMail(mailOptions);
        } catch (error) {
           throw new CustomError(AuthMessages.FAILED_TO_SEND_EMAIL, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

}
