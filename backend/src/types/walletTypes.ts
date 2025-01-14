import mongoose, { Document } from 'mongoose';

export interface WalletTransactionData {
    transactionId: string;
    amount: number;
    type: 'credit' | 'debit';  
    date: Date;
    status: 'completed' | 'pending' | 'failed'; 
}       

export interface IWallet extends Document {
    _id: mongoose.Types.ObjectId,
    walletOwner: mongoose.Types.ObjectId,
    transactions: WalletTransactionData[]
    walletBalance: number;
    totalPurchases: number;
    totalSpent: number;
    isActive: boolean;
}

