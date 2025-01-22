import { IBaseRepository } from "../base/IBaseRepository";
import { IWallet } from "../../types/walletTypes";
import { FilterQuery } from "mongoose";

export interface IWalletRepossitory extends IBaseRepository<IWallet> {
    findOneWithPaginatedTransactions(filter: FilterQuery<IWallet>, skip: number, limit: number) : Promise<Partial<IWallet> & { totalTransactions: number } | null>
}