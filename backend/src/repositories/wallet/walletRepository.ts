import { Model, Document, FilterQuery } from 'mongoose';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/baseRepository';
import { IWallet } from '../../types/walletTypes';
import { IWalletRepossitory } from './IWalletRepository';

@injectable()
export class WalletRepository extends BaseRepository<IWallet> implements IWalletRepossitory {
    constructor(
        @inject('WalletModel') private walletModel: Model<IWallet & Document>
    ) {
        super(walletModel);
        this.walletModel = walletModel
    }

    async findOneWithPaginatedTransactions(filter: FilterQuery<IWallet>, skip: number, limit: number): Promise<Partial<IWallet> & { totalTransactions: number } | null> {
        const wallet = await this.walletModel.findOne(filter).lean().exec();
        if (!wallet) return null;

        const totalTransactions = wallet.transactions.length;
        wallet.transactions = wallet.transactions.slice(skip, skip + limit);

        return {
            ...wallet,
            totalTransactions
        };
    }
}