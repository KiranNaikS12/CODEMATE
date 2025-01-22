import { ApiResponse } from "./types";

export interface WalletTransactionData {
    _id: string;
    transactionId: string;
    amount: number;
    type: 'credit' | 'debit';  
    date: Date; 
    status:  'completed' | 'pending' | 'failed'; 
}

export interface IWallet {
    _id: string,
    walletOwner: string;
    transactions: WalletTransactionData[]
    walletBalance: number;
    totalPurchases: number;
    totalSpent: number;
    isActive: boolean;
    totalTransactions: number;
}

export type showWalletDetailsResponse = ApiResponse<IWallet>

export interface PaymentSuccessResponse {
    transactionId: string,
    amount: number;

}

export type showPaymentDetailsResponseFromWallet = ApiResponse<PaymentSuccessResponse> 