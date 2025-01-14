import { Model, Document } from 'mongoose';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/baseRepository';
import { IWallet } from '../../types/walletTypes';
import { IWalletRepossitory } from './IWalletRepository';

@injectable()
export class WalletRepository extends BaseRepository<IWallet> implements IWalletRepossitory {
    constructor(
        @inject('WalletModel') private  walletModel: Model<IWallet & Document>
    ) {
        super(walletModel);
        this.walletModel = walletModel
    }
}