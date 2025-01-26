import express, { Request, Response } from 'express';
import { container } from '../config/di-containers';
import {authMiddleware, protectRole} from '../middleware/authMiddleware';
import { AuthController } from '../controllers/auth/authController';
import { UserProfileController } from '../controllers/user/userProfileController';
import { CloudinaryService } from '../config/cloudinaryConfig';
import { ProblemController } from '../controllers/problems/problemsController';
import { Role } from '../types/commonTypes';
import { CourseController } from '../controllers/course/courseController';
import { CartController } from '../controllers/cart/cartController';
import { WishlistController } from '../controllers/wishlist/wishlistController';
import { ManageTutorController } from '../controllers/admin/manageTutorController';
import { PaymentController } from '../controllers/paymentController/paymentController';
import { WalletController } from '../controllers/wallet/walletController';
import { ReviewController } from '../controllers/courseReview/reviewController';
import { FeedbackController } from '../controllers/problemFeedback/feedbackController';
import { ManageUserController } from '../controllers/admin/manageUserController';


const router = express.Router();
const authController = container.get<AuthController>('AuthController');
const userProfileController = container.get<UserProfileController>('UserProfileController');
const manageProblemController = container.get<ProblemController>('ProblemController');
const manageCourseController = container.get<CourseController>('CourseController');
const manageCartController = container.get<CartController>('CartController');
const manageWishlistController = container.get<WishlistController>('WishlistController');
const manageTutorController = container.get<ManageTutorController>('ManageTutorController');
const managePayementController = container.get<PaymentController>('PaymentController');
const manageWalletController = container.get<WalletController>('WalletController');
const mangageReviewController = container.get<ReviewController>('ReviewController');
const manageFeedBackController = container.get<FeedbackController>('FeedbackController');
const manageUserController = container.get<ManageUserController>('ManageUserController');
const cloudinaryService = new CloudinaryService();



//public routes
router.post('/initiate-register',(req, res) => authController.initiateRegistration(req, res));
router.post('/verify-user', (req, res) => authController.verifyUser(req, res));
router.post('/auth/google', (req,res) => authController.googleAuthUser(req,res));
router.post('/login', (req, res) => authController.loginUser(req, res));
router.post('/forget-password', (req,res) => authController.forgetPassword(req,res));
router.patch('/reset-password/:id/:token', (req, res) => authController.resetPassword(req,res));


//protected routes
router.post('/logout', authMiddleware, (req, res) => authController.logoutUser(req, res));
router.get('/profile/:id', protectRole([Role.User]), authMiddleware, (req,res) => userProfileController.displayUser(req,res))
router.put('/update-profile/:id', protectRole([Role.User]), authMiddleware, (req,res) => userProfileController.updateUserProfileDetails(req,res));
router.get('/list-problems', protectRole([Role.User]), authMiddleware, (req,res) => manageProblemController.listProblems(req,res))
router.patch('/update-image/:id',protectRole([Role.User]),authMiddleware,cloudinaryService.multerUploadImage,(req,res,next) => { next();},(req,res) => userProfileController.updateUserImage(req,res));
router.put('/update-account/:id', protectRole([Role.User]), authMiddleware, (req,res) => userProfileController.updateUserAccountInfo(req,res));
router.patch('/update-password/:id', protectRole([Role.User]), authMiddleware, (req,res) => userProfileController.updatePassword(req,res));
router.get('/list-courses', protectRole([Role.User]), authMiddleware, (req,res) => manageCourseController.listCourse(req,res));
router.post('/cart/add', protectRole([Role.User]), authMiddleware, (req,res) => manageCartController.createCart(req,res));
router.post('/wishlist/add', protectRole([Role.User]), authMiddleware, (req,res) => manageWishlistController.createWishlist(req,res));
router.get('/list-tutors', protectRole([Role.User]), authMiddleware, (req,res) => manageTutorController.listTutors(req,res));
router.get('/list-cart/:id', protectRole([Role.User]), authMiddleware, (req,res) => manageCartController.listCartItems(req,res))
router.delete('/remove-items', protectRole([Role.User]), authMiddleware, (req,res) => manageCartController.removeCartItem(req,res));
router.get('/list-wishlist/:id', protectRole([Role.User]), authMiddleware, (req,res) => manageWishlistController.listWishlistItems(req,res));
router.delete('/remove-wishlist', protectRole([Role.User]), authMiddleware, (req,res) => manageWishlistController.removeWishlistItem(req,res));
router.post('/create-checkout-session', protectRole([Role.User]), authMiddleware, (req, res) => managePayementController.createCheckoutSession(req,res));
router.post('/verify-payment-success', protectRole([Role.User]), authMiddleware, (req,res) => managePayementController.verifyPayment(req,res));
router.post('/verify-payment-failure', protectRole([Role.User]), authMiddleware, (req,res) => managePayementController.verifyPaymentFailure(req,res));
router.get('/list-user-orders/:id', protectRole([Role.User]), authMiddleware, (req,res) => managePayementController.listUserOrders(req,res));
router.patch('/retry-payment', protectRole([Role.User]), authMiddleware, (req,res) => managePayementController.handleRetryPayment(req,res));
router.post('/activate-wallet', protectRole([Role.User]), authMiddleware, (req,res) => manageWalletController.activateUserWallet(req,res));
router.get('/list-wallet/:id', protectRole([Role.User]), authMiddleware, (req,res) => manageWalletController.getWalletInfo(req,res));
router.put('/update-wallet', protectRole([Role.User]), authMiddleware, (req,res) => manageWalletController.walletTopUp(req,res));
router.patch('/wallet-success-stat', protectRole([Role.User]), authMiddleware, (req,res) => manageWalletController.verifySuccessPayment(req,res));
router.patch('/wallet-failure-stat', protectRole([Role.User]), authMiddleware, (req,res) => manageWalletController.verifyFailedPaymnet(req,res));
router.post('/wallet-payment', protectRole([Role.User]), authMiddleware, (req,res) => managePayementController.handleWalletPayment(req,res));
router.get('/view-course/:id', protectRole([Role.User]), authMiddleware, (req,res) => manageCourseController.viewCourseDetails(req,res));
router.post('/add-review', protectRole([Role.User]), authMiddleware, (req,res) => mangageReviewController.addCourseReview(req,res));
router.get('/list-reviews/:id', protectRole([Role.User]), authMiddleware, (req,res) => mangageReviewController.listCourseReview(req,res));
router.get('/view-problem/:id', protectRole([Role.User]), authMiddleware, (req,res) => manageProblemController.getProblemData(req,res));
router.post('/run-code', protectRole([Role.User]), authMiddleware, (req,res) => manageProblemController.handleRunCode(req,res));
router.post('/submit-code', protectRole([Role.User]), authMiddleware, (req,res) => manageProblemController.handleCodeSubmission(req,res));
router.post('/add-feedback', protectRole([Role.User]), authMiddleware, (req,res) => manageFeedBackController.addFeedback(req,res));
router.get('/list-feedback/:id', protectRole([Role.User]), authMiddleware, (req,res) => manageFeedBackController.listProblemFeedback(req,res));
router.get('/enroll-course/:id', protectRole([Role.User]), authMiddleware, (req,res) => manageCourseController.listEnrolledCourses(req,res));
router.post('/problem-review', protectRole([Role.User]), authMiddleware, (req,res) => mangageReviewController.addProblemReview(req,res));
router.get('/list-problem-review/:id', protectRole([Role.User]), authMiddleware, (req,res) => mangageReviewController.listProblemReviews(req,res));
router.get('/list-user/:userId', protectRole([Role.User]), authMiddleware, (req,res) => manageUserController.displayUserDetail(req,res));
router.get('/get-count', protectRole([Role.User]), authMiddleware, (req,res) => manageProblemController.getTotalProblemCounts(req,res));
router.get('/get-stats/:id', protectRole([Role.User]), authMiddleware, (req,res) => userProfileController.getDashboardStats(req,res));
router.get('/tutor/:tutorId', protectRole([Role.User]), authMiddleware, (req,res) => manageTutorController.displayTutorDetails(req,res));
router.put('/course/progress', protectRole([Role.User]), authMiddleware, (req,res) => manageCourseController.updateUserCourseProgress(req,res))

export default router;