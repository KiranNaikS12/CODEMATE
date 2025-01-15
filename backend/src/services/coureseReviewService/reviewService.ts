import { inject, injectable } from "inversify";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { IProblemReview, IReview } from "../../types/reviewTypes";
import { CustomError } from "../../utils/customError";
import { AuthMessages } from "../../utils/message";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { ICourseRepository } from "../../repositories/course/ICourseRepository";
import { IPaymentRepository } from "../../repositories/payment/IPaymentRepository";
import { IProblemRepository } from "../../repositories/problems/IProblemRepository";
import { IProblemReviewRepository } from "../../repositories/reviews/IProblemReviewRepository";
import { IReviewService } from "./IReviewService";
import { IReviewRepository } from "../../repositories/reviews/IReviewRepository";


@injectable()
export class ReviewService implements IReviewService{
    constructor (
        @inject('ReviewRepository') private ReviewRepository: IReviewRepository,
        @inject('UserRepository') private UserRepository: IUserRepository,
        @inject('CourseRepository') private CourseRepository: ICourseRepository,
        @inject('PaymentRepository') private PaymentRepository: IPaymentRepository,
        @inject('ProblemReviewRepository') private ProblemReviewRepository: IProblemReviewRepository,
        @inject('ProblemRepository') private ProblemRepository: IProblemRepository,
    ) {}

    async addCourseReview (userId: string, courseId: string, reviewDetails: { ratings: number, title: string, feedback: string } ) : Promise <IReview | null > {

        const [user, course, orders] = await Promise.all([
            this.UserRepository.findById(userId),
            this.CourseRepository.findById(courseId),
            this.PaymentRepository.find({user: userId})
        ]);


        if(!user) throw new CustomError(AuthMessages.USER_NOT_FOUND,HttpStatusCode.NOT_FOUND);
        if(!course) throw new CustomError(AuthMessages.COURSE_NOT_FOUND, HttpStatusCode.NOT_FOUND);

        const hashPurchasedCourse = orders.some((order) => 
             order.items.some((item) => item.course.toString() === courseId)
        );

        if(!hashPurchasedCourse) {
           throw new CustomError(AuthMessages.NOT_PURCHASED, HttpStatusCode.UNAUTHORIZED);
        
        }

        const { ratings, title, feedback } = reviewDetails;

        const review = await this.ReviewRepository.create({
            user: user._id,
            course: course._id,
            ratings,
            title,
            feedback
        });

        await this.updateCourseReview(course._id.toString())

        return review;
    }

    async updateCourseReview(courseId: string) : Promise<void> {
        try {

            const reviews = await this.ReviewRepository.find({course: courseId});

            if(reviews.length === 0) {
                throw new CustomError(AuthMessages.NO_REVIEWS_FOUND, HttpStatusCode.NOT_FOUND)
            }

            const totalReviews = reviews.length;
            const totalRatings = reviews.reduce((acc, review) => acc + review.ratings , 0)

            const averageRating = totalRatings / totalReviews;

            await this.CourseRepository.update(courseId, {
                averageRating: averageRating,
                reviewCount: totalReviews
            });

        }  catch (error) {
            console.log('Error', error);
            throw new CustomError(AuthMessages.FAILED_TO_UPDATE_COURSE_REVIEW, HttpStatusCode.BAD_REQUEST)
        }
    }

    async listCourseReviews (courseId: string) : Promise<Partial<IReview[]>> {
        const reviews = await this.ReviewRepository.listCourseReviews(courseId)

        if(!reviews) {
            throw new CustomError(AuthMessages.NO_REVIEWS_FOUND, HttpStatusCode.NOT_FOUND)
        }

        return reviews;
    }

    async addProblemReviews (userId: string, problemId: string, reviewDetails: { ratings: number, reviews: string } ) : Promise<IProblemReview | null> {
        console.log(problemId)
        const [user, problem ] = await Promise.all([
            this.UserRepository.findById(userId),
            this.ProblemRepository.findById(problemId)
        ])

        console.log('problem', problem)

        if(!user) throw new CustomError(AuthMessages.USER_NOT_FOUND,HttpStatusCode.NOT_FOUND);
        if(!problem) throw new CustomError(AuthMessages.PROBLEM_NOT_FOUND, HttpStatusCode.NOT_FOUND);

        const hasSubmitted = problem.submission?.some((data) => data.user.toString() === user._id.toString());
        // console.log(hasSubmitted)

        if(!hasSubmitted) {
            throw new CustomError(AuthMessages.UNSUBMITTED_CODE, HttpStatusCode.UNAUTHORIZED)
        }

        const { ratings, reviews } = reviewDetails;

        const review = await this.ProblemReviewRepository.create({
            user: user._id,
            problem: problem._id,
            ratings,
            reviews
        });

        await this.updateProblemReview(problem._id.toString());

        return review;
    }

    async updateProblemReview(problemId: string) : Promise<void> {
        try {
            const reviews = await this.ProblemReviewRepository.find({problem:problemId});

            if(reviews.length === 0) {
                throw new CustomError(AuthMessages.NO_REVIEWS_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const totalReview = reviews.length;
            const totalRatings = reviews.reduce((acc, review) => acc + review.ratings, 0);

            const averageRating = totalRatings / totalReview;

            await this.ProblemRepository.update(problemId, {
                averageRatings: averageRating,
                reviewCount: totalReview
            });

        }   catch (error) {
            throw new CustomError(AuthMessages.FAILED_TO_UPDATE_PROBLEM_REVIEW, HttpStatusCode.BAD_REQUEST)
        }
    }

    async listProblemReview(ProblemId: string) : Promise<Partial<IProblemReview[]>> {
        const review = await this.ProblemReviewRepository.listProblemReviews(ProblemId);

        if(!review) {
            throw new CustomError(AuthMessages.NO_REVIEWS_FOUND, HttpStatusCode.NOT_FOUND);
        }

        return review;
    }
}