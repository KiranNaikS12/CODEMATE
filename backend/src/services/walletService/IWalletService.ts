import { PaymentStat } from "../../types/commonTypes";
import { IWallet } from "../../types/walletTypes";
export interface IWalletService {
    activateWallet(userId: string) : Promise<IWallet>;
    getWalletInfo(userId: string) : Promise<IWallet>;
    handleWalletPayment(userId: string, amount: number) : Promise<string | null>;
    verifySuccessPayment(sesssionId: string) : Promise<(PaymentStat)>;
    verifyFailedPayment(sessionId: string) : Promise<PaymentStat>;
}