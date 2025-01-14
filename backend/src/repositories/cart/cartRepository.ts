import { Model, Document, PopulateOptions} from 'mongoose';
import { inject, injectable } from 'inversify';
import { ICartRepository} from './ICartRepository'
import { BaseRepository } from '../base/baseRepository';
import { ICart } from '../../types/cartTypes';
import { CustomError } from '../../utils/customError';
import { HttpStatusCode } from '../../utils/httpStatusCode';
import { AuthMessages } from '../../utils/message';

@injectable()
export class cartRepository extends BaseRepository<ICart> implements ICartRepository{
    
    private readonly defaultPopulateOptions: PopulateOptions = {
        path: 'items.course',
        select: 'title tutorName price discount',
        model:'Course'
    }

    constructor(
        @inject('CartModel') private cartModel: Model<ICart & Document>
    ) {
        super(cartModel);
    }

    async findByWithCart(userId: string): Promise<ICart | null> {
        try{
            return await this.findOneWithPopulate(
                {user: userId},
                this.defaultPopulateOptions
            )
        } catch (error) {
            throw new CustomError(AuthMessages.ERROR_FETECHING_CART_BY_USER, HttpStatusCode.BAD_REQUEST);
        }
    }

    async listCartItems(userId: string): Promise<ICart | null> {
        const cartPopulateOptions: PopulateOptions = {
            path:'items.course',
            select:'_id title coverImage tutorName language subject category price discount',
            model:'Course'
        }
        return await this.findOneWithPopulate(
            {user: userId},
            cartPopulateOptions
        )
    }
}

