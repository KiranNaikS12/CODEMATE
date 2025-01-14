import { PaymentStat } from "../../types/commonTypes";
import { IOrder } from "../../types/orderTypes";
import { IWallet } from "../../types/walletTypes";

export interface IPayemntService {
    createCheckoutSession(userId: string, paymentGateway: string) : Promise<string | null> ;
    verifySuccessPayment(sessionId: string) : Promise<PaymentStat>;
    verifyFailurePayment(sessionId: string) : Promise<PaymentStat>;
    listUserOrder (userId: string, page: number, limit: number) : Promise<{ orders: Partial<IOrder[]>; totalPagesCount: number }>
    handleRetryPayment(userId: string, order_id:string) : Promise<string | null>;
    handleWalletPayment(userId: string, paymentGateway: string) : Promise<IWallet>
}