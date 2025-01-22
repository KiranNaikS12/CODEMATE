import { inject, injectable } from "inversify";
import Stripe from 'stripe';
import { IWalletRepossitory } from "../../repositories/wallet/IWalletRepository";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { CustomError } from "../../utils/customError";
import { AuthMessages } from "../../utils/message";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { IWallet } from "../../types/walletTypes";
import { v4 as uuidv4} from 'uuid';
import { IWalletService } from "./IWalletService";
import { PaymentStat } from "../../types/commonTypes";
import { UpdateQuery } from "mongoose";

@injectable()
export class WalletService implements IWalletService {
    private stripe: Stripe;
    constructor(
        @inject('WalletRepository') private WalletRepository: IWalletRepossitory,
        @inject('UserRepository') private UserRepository: IUserRepository,
        @inject('StripeClient') stripe: Stripe
    ) {
        this.stripe = stripe
    }

    async activateWallet(userId: string) : Promise<IWallet> {
        if(!userId) {
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }

        const user = await this.UserRepository.findById(userId);
        if(!user) {
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }

        const wallet = await this.WalletRepository.create({
            walletOwner: user._id,
            walletBalance: 100,
            totalPurchases: 0,
            totalSpent: 0,
            isActive: true
        });

        return wallet;
    }

    async getWalletInfo (userId: string, page: number, limit: number) : Promise<Partial<IWallet> & { totalTransactions: number } | null> {
        if(!userId) {
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }

        const skip = (page - 1) * limit;

        const userWallet = await this.WalletRepository.findOneWithPaginatedTransactions(
            {walletOwner: userId},
            skip,
            limit
        );
        if(!userWallet) {
            throw new CustomError(AuthMessages.WALLET_INFO_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }
        return userWallet;
    }


    async handleWalletPayment(userId: string, amount: number) : Promise<string | null> {
        if(!userId) {
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }
        
        const userWallet = await this.WalletRepository.findOne({walletOwner: userId});
        if(!userWallet) {
            throw new CustomError(AuthMessages.WALLET_INFO_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }

        if(amount < 100 ){
            throw new CustomError(AuthMessages.INVALID_AMOUNT, HttpStatusCode.BAD_REQUEST)
        }

        try {
            const transactionId = `TXN-${uuidv4().slice(0,13)}`;

            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: 'Wallet Top Up',
                                description: 'Added money to your digital wallet'
                            },
                            unit_amount: amount * 100,
                        },
                        quantity: 1
                    }
                ],
                mode:'payment',
                success_url: `${process.env.CORS_ORIGIN}/wallet-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CORS_ORIGIN}/wallet-failure?session_id={CHECKOUT_SESSION_ID}`,
                metadata : {
                    walletId: userWallet._id.toString(),
                    transactionId,
                    amount
                }
            });
 
            const transaction = {
                transactionId: transactionId,
                amount,
                type:'credit',     

                status:'pending',
                date: new Date()
            }

            const initialWallet = await this.WalletRepository.update(
                userWallet._id.toString(),
                {   
                    $push: {transactions: transaction },
                    $set: {updatedAt: new Date()}
                } as UpdateQuery<IWallet>
            )  

            if(!initialWallet){
                throw new CustomError(AuthMessages.WALLET_UPDATE_FAILED, HttpStatusCode.INTERNAL_SERVER_ERROR)
            }

            return session.url
            
        }   catch (error) {
            console.log(error)
            throw new CustomError(AuthMessages.PAYMENT_VERIFICATION_FAILED,HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    
    async verifySuccessPayment (sessionId : string) : Promise<PaymentStat> {
        try {      
            const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['payment_intent', 'line_items']
            });

            if (!session.metadata) {
                throw new CustomError(AuthMessages.WALLET_INFO_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const walletId = session.metadata?.walletId;
            const transactionId = session.metadata?.transactionId;
            
            if (!walletId || !transactionId) {
                throw new CustomError(AuthMessages.WALLET_INFO_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }    

            const wallet = await this.WalletRepository.findById(walletId);
            if(!wallet) {
                throw new CustomError(AuthMessages.WALLET_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const transactionIndex = wallet.transactions.findIndex(
                (txn) => txn.transactionId === transactionId
            );

            if(transactionIndex === -1) {
                throw new CustomError(AuthMessages.TRANSACTION_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            if (wallet.transactions[transactionIndex].status === 'completed') {
                return {
                    transactionId,
                    amount: wallet.transactions[transactionIndex].amount
                };
            }

            if(!session.amount_total) {
                throw new CustomError(AuthMessages.AMOUNT_NOT_FOUND, HttpStatusCode.NOT_FOUND)
            }
            
            const transactionAmount = session.amount_total / 100;

            wallet.transactions[transactionIndex].amount = transactionAmount;
            wallet.transactions[transactionIndex].status = 'completed';

            wallet.walletBalance = wallet.walletBalance + transactionAmount;

            await this.WalletRepository.update(wallet._id.toString(), wallet)

            return {
                transactionId,
                amount: transactionAmount
            }
            
        }   catch (error) {
            console.error("Error verifying payment:", error);
            throw new CustomError(AuthMessages.PAYMENT_VERIFICATION_FAILED, HttpStatusCode.BAD_REQUEST)
        }
    }



    async verifyFailedPayment (sessionId: string) : Promise<PaymentStat> {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['payment_intent', 'line_items']
            });
            
            if (!session.metadata) {
                throw new CustomError(AuthMessages.WALLET_INFO_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const walletId = session.metadata?.walletId;
            const transactionId = session.metadata?.transactionId;
            
            if (!walletId || !transactionId) {
                throw new CustomError(AuthMessages.WALLET_INFO_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }    

            const wallet = await this.WalletRepository.findById(walletId);
            if(!wallet) {
                throw new CustomError(AuthMessages.WALLET_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const transactionIndex = wallet.transactions.findIndex(
                (txn) => txn.transactionId === transactionId
            );

            if(transactionIndex === -1) {
                throw new CustomError(AuthMessages.TRANSACTION_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const transactionStatus = wallet.transactions[transactionIndex].status;
             
            wallet.transactions[transactionIndex].status = 'failed';

            await this.WalletRepository.update(wallet._id.toString(), wallet)

            return {
                transactionId,
                            
            }
        }  catch (error) {
            console.log('payment verificatoin failed', error);
            throw new CustomError(AuthMessages.PAYMENT_VERIFICATION_FAILED, HttpStatusCode.BAD_REQUEST)
        }
    }
}


