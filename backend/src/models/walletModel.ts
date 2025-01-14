import mongoose, { Schema } from 'mongoose';
import { IWallet } from '../types/walletTypes';

const transactionSchema = new Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
        default:0
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'failed'],
        default: 'pending'
    }
});

const walletSchema = new Schema<IWallet>({
    walletOwner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        
    },
    transactions: [transactionSchema],
    walletBalance: {
        type: Number,
        required: true,
        default: 0,
        min: 0  
    },
    totalPurchases: {
        type: Number,
        default: 0,
        min: 0
    },
    totalSpent: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
});

const walletModel = mongoose.model<IWallet>('Wallet', walletSchema);
export default walletModel;