import { Response, Request} from 'express';
import { inject, injectable} from 'inversify';
import { handleErrorResponse } from '../../utils/HandleErrorResponse';
import { HttpStatusCode } from '../../utils/httpStatusCode';
import { formatResponse } from '../../utils/responseFormatter';
import { AuthMessages } from '../../utils/message';
import { IWishlistservice } from '../../services/wishlistService/IWishlistService';

@injectable()
export class WishlistController {
   constructor (
      @inject('WishlistService') private WishlistService: IWishlistservice
   ) {}


   async createWishlist(req:Request, res:Response) : Promise<void>{
      try {
        const { userId, courseId} = req.body;
        const wishlist = await this.WishlistService.addToWishlist(userId, courseId)
        res.status(HttpStatusCode.Ok).json(formatResponse(null, AuthMessages.WISHLIST_ADDED))
      } catch (error) {
         handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
      }
   }

   async listWishlistItems(req:Request, res:Response) : Promise<void> {
      try {
         const { id } = req.params
         if(!id) {
            res.status(HttpStatusCode.BAD_REQUEST).json(formatResponse(null, AuthMessages.INVALID_USER_ID));
            return;
         }
         const wishlist = await this.WishlistService.listWishlistItems(id);
         
         res.status(HttpStatusCode.Ok).json(formatResponse(wishlist, AuthMessages.WISHLIST_LISTED_SUCCESSFULLY))
      } catch (error) {
         handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
      }
   }

   async removeWishlistItem(req:Request, res:Response) : Promise<void> {
      try {
         const { userId, itemId } = req.body;
         const updateWishlist = await this.WishlistService.removeWishlistItem(userId, itemId);
         if(!updateWishlist) {
             res.status(HttpStatusCode.BAD_REQUEST).json(formatResponse(null, AuthMessages.FAILED_TO_UPDATE_WISHLIST))
             return;
         }
         res.status(HttpStatusCode.Ok).json(formatResponse(null, AuthMessages.WISHLIST_UPDATED_SUCCESSFULLY))
      } catch (error) {
         handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
      }
   }
}
