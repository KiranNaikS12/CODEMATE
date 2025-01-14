import { IWishlist } from "../../types/wishlistTypes";
import { IBaseRepository } from "../base/IBaseRepository";

export interface IWishlistRepository extends IBaseRepository<IWishlist> {
    listItems(userId: string) : Promise<IWishlist | null>
}