import mongoose from "mongoose";
import { injectable, inject } from "inversify";
import { ICourseRepository } from "../../repositories/course/ICourseRepository";
import { IPopulatedWishlist, IPopulatedWishlistItem, IWhishlistItem, IWishlist, IWishlistResponse } from "../../types/wishlistTypes";
import { CustomError } from "../../utils/customError";
import { AuthMessages } from "../../utils/message";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { IWishlistservice } from "./IWishlistService";
import { IWishlistRepository } from "../../repositories/wishlist/IWishlistRepository";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { getSignedUrl } from "../../config/s3";
import { ICourse } from "../../types/courseTypes";

@injectable()
export class WishlistService implements IWishlistservice {
    constructor(
        @inject('WishlistRepository') private WishlistRepository: IWishlistRepository,
        @inject('CourseRepository') private CourseRepository: ICourseRepository,
        @inject('UserRepository') private UserRepository: IUserRepository
    ) { }

    async addToWishlist(userId: string, courseId: string): Promise<IWishlist | null> {
        if (!userId || !courseId) {
            throw new CustomError(AuthMessages.COURSE_AND_USER_ID_MISSING, HttpStatusCode.BAD_REQUEST)
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const course = await this.CourseRepository.findById(courseId);
        if (!course) {
            throw new CustomError(AuthMessages.COURSE_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }

        let wishlist = await this.WishlistRepository.findOne({ user: userId })

        if (!wishlist) {
            wishlist = await this.WishlistRepository.create({
                user: userObjectId,
                items: [],
                totalItemCount: 0
            })
        }

        const courseExists = wishlist.items.find(item => item.course._id.toString() === courseId);
        if (courseExists) {
            throw new CustomError(AuthMessages.COURSE_EXISTS_IN_WISHLIST, HttpStatusCode.CONFLICT)
        }

        const wishlistItem: IWhishlistItem = {
            course: course._id,
        };

        wishlist.items.push(wishlistItem);
        wishlist.totalItemCount += 1;

        const updateWishlist = await this.WishlistRepository.update(wishlist._id.toString(), wishlist);
        return updateWishlist;
    }

    async listWishlistItems(userId: string): Promise<IWishlistResponse | Partial<IWishlist>> {
        if (!userId) {
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }

        const user = await this.UserRepository.findById(userId);
        if (!user) {
            throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND)

        }


        const wishlist = await this.WishlistRepository.listItems(userId) as IPopulatedWishlist | null;

        if (!wishlist) {
            return {
                user: new mongoose.Types.ObjectId(userId),
                items: [],
                totalItemCount: 0
            }
        }

        const itemsWithSignedUrls = await Promise.all(wishlist.items.map(async (item) => {
            const populatedCourse = item.course as ICourse;

            return {
                _id: item._id.toString(),
                course: {
                    _id: populatedCourse._id.toString(),
                    title: populatedCourse.title,
                    coverImage: await getSignedUrl(
                        process.env.S3_BUCKET_NAME!,
                        populatedCourse.coverImage
                    ),
                    tutorName: populatedCourse.tutorName,
                    language: populatedCourse.language,
                    subject: populatedCourse.subject,
                    category: populatedCourse.category,
                    price: populatedCourse.price,
                    discount: populatedCourse.discount
                }
            };
        }));
        return {
            _id: wishlist._id.toString(),
            user: wishlist.user.toString(),
            items: itemsWithSignedUrls,
            wishlistItemCount: wishlist.totalItemCount
        };

    }

    async removeWishlistItem(userId: string, itemId: string): Promise<IWishlist | null> {
        if (!userId || !itemId) {
            throw new CustomError(AuthMessages.USERID_ITEMID_MISSING, HttpStatusCode.NOT_FOUND)
        }

        const wishlist = await this.WishlistRepository.findOne({ user: userId });
        if (!wishlist) {
            throw new CustomError(AuthMessages.WISHLIST_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }

        const wishlistIndex = wishlist.items.findIndex(item => item._id?.toString() === itemId);
        if (wishlistIndex === -1) {
            throw new CustomError(AuthMessages.WISHLIST_IS_EMPTY, HttpStatusCode.NOT_FOUND)
        }

        wishlist.items.splice(wishlistIndex, 1);
        wishlist.totalItemCount -= 1;

        return await this.WishlistRepository.update(wishlist._id.toString(), wishlist)
    }
}