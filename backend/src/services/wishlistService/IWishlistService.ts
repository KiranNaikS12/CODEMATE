import { IWishlist, IWishlistResponse } from "../../types/wishlistTypes";

export interface IWishlistservice {
    addToWishlist(userId: string, courseId: string) : Promise<IWishlist | null>;
    listWishlistItems(userId: string) : Promise<IWishlistResponse | Partial<IWishlist>>;
    removeWishlistItem(userId: string, itemId: string) : Promise<IWishlist | null>;
}