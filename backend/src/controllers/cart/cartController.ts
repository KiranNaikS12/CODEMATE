import { Response, Request} from 'express';
import { injectable, inject } from "inversify";
import { handleErrorResponse } from '../../utils/HandleErrorResponse';
import { HttpStatusCode } from '../../utils/httpStatusCode';
import { formatResponse } from '../../utils/responseFormatter';
import { AuthMessages } from '../../utils/message';
import { ICartService } from '../../services/cartService/ICartService';


@injectable()
export class CartController{
    constructor(
        @inject('CartService') private CartService: ICartService
    ) {}

    async createCart(req:Request, res:Response) : Promise<void> {
        try {
            const { userId, courseId} = req.body;
            const cart = await this.CartService.addToCart(userId, courseId);
            res.status(HttpStatusCode.Ok).json(formatResponse(null, AuthMessages.CART_ADDED))
        } catch (error) {
            handleErrorResponse(res,error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async listCartItems(req:Request, res:Response) : Promise<void> {
        try {
            const { id } = req.params;
            if(!id) {
                res.status(HttpStatusCode.BAD_REQUEST).json(formatResponse(null, AuthMessages.INVALID_USER_ID));
                return;
            }
            const cartData = await this.CartService.listCartItems(id);
            res.status(HttpStatusCode.Ok).json(formatResponse(cartData,AuthMessages.CART_LISTED_SUCCESSFULLY))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async removeCartItem(req:Request, res:Response) : Promise<void> {
        try {
            const { userId, itemId} = req.body;
            const updatedCart = await this.CartService.removeCartItems(userId, itemId)
            if(!updatedCart) {
                res.status(HttpStatusCode.BAD_REQUEST).json(formatResponse(null, AuthMessages.FAILED_TO_UPDATE_CART));
                return;
            }
            res.status(HttpStatusCode.Ok).json(formatResponse(null, AuthMessages.ITEM_REMOVED_SUCCESSFULLY))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }
}