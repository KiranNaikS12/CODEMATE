import { PaymentStat } from "../../types/commonTypes";
import { IWallet } from "../../types/walletTypes";
export interface IWalletService {
    activateWallet(userId: string) : Promise<IWallet>;
    getWalletInfo (userId: string, page: number, limit: number) : Promise<Partial<IWallet> & { totalTransactions: number } | null>
    handleWalletPayment(userId: string, amount: number) : Promise<string | null>;
    verifySuccessPayment(sesssionId: string) : Promise<(PaymentStat)>;
    verifyFailedPayment(sessionId: string) : Promise<PaymentStat>;
}