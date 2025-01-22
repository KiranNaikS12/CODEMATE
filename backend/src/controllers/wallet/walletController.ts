import { Request, Response} from 'express';
import { inject, injectable } from 'inversify';
import { handleErrorResponse } from '../../utils/HandleErrorResponse';
import { HttpStatusCode } from '../../utils/httpStatusCode';
import { formatResponse } from '../../utils/responseFormatter';
import { AuthMessages } from '../../utils/message';
import { IWalletService } from '../../services/walletService/IWalletService';

@injectable()
export class WalletController {
    constructor(
        @inject('WalletService') private WalletService: IWalletService
    ) {}

    async activateUserWallet (req: Request, res:Response) : Promise<void> {
        try { 
            const { userId } = req.body;
            const wallet = await this.WalletService.activateWallet(userId);
            res.status(HttpStatusCode.Ok).json(formatResponse(null, AuthMessages.YOUR_WALLET_ACTIVATED_SUCCESSFULLY))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.NOT_FOUND)
        }
    }

    async getWalletInfo (req:Request, res:Response) : Promise<void> {
        try {
            const { id } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;
            const walletInfo = await this.WalletService.getWalletInfo(id, page, limit);
            res.status(HttpStatusCode.Ok).json(formatResponse(walletInfo, AuthMessages.YOUR_WALLET_ACTIVATED_SUCCESSFULLY));

        }   catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.NOT_FOUND)
        }
    }

    async walletTopUp (req:Request, res:Response)  : Promise<void> {
        try {
            const { userId, amount } = req.body;
            const session = await this.WalletService.handleWalletPayment(userId, amount);
            res.status(HttpStatusCode.CREATED).json(formatResponse(session, AuthMessages.PAYMENET_VERIFIED_SUCCESSFULLY))
        }   catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async verifySuccessPayment (req:Request, res:Response) : Promise<void> {
        try {
            const { sessionId } = req.body;
            const walletData = await this.WalletService.verifySuccessPayment(sessionId);
            res.status(HttpStatusCode.CREATED).json(formatResponse(walletData, AuthMessages.PAYMENET_VERIFIED_SUCCESSFULLY))

        }   catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async verifyFailedPaymnet (req:Request, res: Response) : Promise<void> {
        try {
            const { sessionId } = req.body;
            const walletData = await this.WalletService.verifyFailedPayment(sessionId);
            console.log(walletData)
            res.status(HttpStatusCode.Ok).json(formatResponse(walletData, AuthMessages.PAYMENT_FAILED))
        }  catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }
}