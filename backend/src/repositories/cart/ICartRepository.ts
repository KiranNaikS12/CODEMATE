import { ICart } from "../../types/cartTypes";
import { IBaseRepository } from "../base/IBaseRepository";

export interface ICartRepository extends IBaseRepository<ICart> {
    findByWithCart(userId:string) : Promise<ICart| null>
    listCartItems(userId: string) : Promise<ICart | null>
}

