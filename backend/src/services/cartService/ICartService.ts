import { ICart, ICartResponse } from "../../types/cartTypes";

export interface ICartService {
    addToCart(userId: string, courseId: string) : Promise<ICart | null>;
    listCartItems(userId: string) : Promise<ICartResponse | Partial<ICart>>;
    removeCartItems(userId: string, itemId: string) : Promise<ICart | null>;
}