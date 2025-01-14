import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { handleErrorResponse } from '../../utils/HandleErrorResponse';
import { HttpStatusCode } from '../../utils/httpStatusCode';
import { formatResponse } from '../../utils/responseFormatter';
import { AuthMessages } from '../../utils/message';
import { IPayemntService } from '../../services/payementService/IPaymentService';
import { CustomError } from '../../utils/customError';

@injectable()
export class PaymentController {
    constructor(
        @inject('PayementService') private PayemntService: IPayemntService,
        
    ) {}

    async createCheckoutSession(req:Request, res:Response) : Promise<void> {
        try {
            const {userId, paymentGateway} = req.body;
            if(!userId) {
                res.status(HttpStatusCode.NOT_FOUND).json(formatResponse(AuthMessages.USER_NOT_FOUND));
                return;
            }
            const sessionData = await this.PayemntService.createCheckoutSession(userId, paymentGateway);
            if(sessionData) {
                res.status(HttpStatusCode.Ok).json(formatResponse(sessionData, AuthMessages.STRIEP_SESSION_CREATED_SUCESSFULLY));
            }

        } catch (error) {
            if(error instanceof CustomError) {
                res.status(error.statusCode).json({message: error.message})
                return; 
            }
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }   

    async verifyPayment (req:Request, res:Response) : Promise<void> {
        try {
            const { sessionId } = req.body;
            const data = await this.PayemntService.verifySuccessPayment(sessionId);
            res.status(HttpStatusCode.Ok).json(formatResponse(data, AuthMessages.PAYMENET_VERIFIED_SUCCESSFULLY))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async verifyPaymentFailure (req:Request, res:Response) : Promise<void> {
        try {
            const { sessionId } = req.body;
            const data = await this.PayemntService.verifyFailurePayment(sessionId)
            res.status(HttpStatusCode.Ok).json(formatResponse(data, AuthMessages.PAYMENT_FAILED))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async listUserOrders (req:Request, res:Response) : Promise<void> {
        try {
            const { id } = req.params;
            const {page, limit} = req.query;
            const { orders, totalPagesCount} = await this.PayemntService.listUserOrder(id, parseInt(page as string, 10), parseInt(limit as string, 10));
            res.status(HttpStatusCode.Ok).json(formatResponse(
                { orders, totalPagesCount}
                , AuthMessages.ORDER_LISTED_SUCESSFULLY))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async handleRetryPayment (req:Request, res:Response) : Promise<void> {
        try {
            const { userId, order_id } = req.body;
            const sessionData = await this.PayemntService.handleRetryPayment(userId, order_id)
            if(sessionData) {
                res.status(HttpStatusCode.Ok).json(formatResponse(sessionData, AuthMessages.STRIEP_SESSION_CREATED_SUCESSFULLY));
            };
        }   catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async handleWalletPayment (req:Request, res:Response) : Promise<void> {
        try {
            const { userId, paymentGateway } = req.body;
            const paymentData = await this.PayemntService.handleWalletPayment(userId, paymentGateway);
            res.status(HttpStatusCode.Ok).json(formatResponse(paymentData, AuthMessages.ORDER_PLACED_SUCCESSFULLY))
        }   catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }


}