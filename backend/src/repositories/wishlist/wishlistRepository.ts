import { Model, Document} from 'mongoose';
import { inject, injectable } from 'inversify';
import { IWishlistRepository } from './IWishlistRepository';
import { BaseRepository } from '../base/baseRepository';
import { IWishlist } from '../../types/wishlistTypes';


@injectable()
export class WishlistRepository extends BaseRepository<IWishlist> implements IWishlistRepository {
    constructor(
        @inject('WishlistModel') private wishlistModel: Model<IWishlist & Document>
    ){
        super(wishlistModel)
        this.wishlistModel = wishlistModel
    }

    async listItems(userId: string): Promise<IWishlist | null> {
        const filter = { user: userId};
        //call base
        const query = this.model.findOne(filter).populate({
            path:'items.course',
            select:'_id title coverImage tutorName language subject category price discount',
            model:'Course'
        });

        return query.exec();
    }
}