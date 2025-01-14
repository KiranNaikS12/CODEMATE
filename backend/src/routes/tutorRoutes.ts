import express,{Request, Response, NextFunction } from 'express'
import { container } from '../config/di-containers';
import { AuthController } from '../controllers/auth/authController';
import { Role } from '../types/commonTypes';
import { authMiddleware } from '../middleware/authMiddleware';
import { TutorApprovalController } from '../controllers/tutor/tutorApprovalController';
import { CloudinaryService } from '../config/cloudinaryConfig';
import { TutorProfileController } from '../controllers/tutor/tutorProfileController';
import { CourseController } from '../controllers/course/courseController';
import upload from '../config/multerConig';
import { ManageEnrolledUserController } from '../controllers/tutor/manageUserController';


const router = express.Router();
const authController = container.get<AuthController>('AuthController');
const tutorController = container.get<TutorApprovalController>('TutorApprovalController');
const tutorProfileController = container.get<TutorProfileController>('TutorProfileController');
const manageCourseController = container.get<CourseController>('CourseController');
const manageUserController = container.get<ManageEnrolledUserController>('ManageEnrolledUserController')

const addTutorRole = (req:Request, res:Response, next:NextFunction) => {
    req.body.roleId = Role.Tutor;
    next();
};

const cloudinaryService = new CloudinaryService();

//public routes
router.post('/initiate-register', addTutorRole, (req,res) => authController.initiateRegistration(req,res));
router.post('/verify-tutor', addTutorRole, (req,res) => authController.verifyUser(req,res));
router.post('/auth/google', (req,res) => authController.googleAuthUser(req,res))
router.post('/login', (req, res) => authController.loginUser(req, res));
router.post('/forget-password', (req, res) => authController.forgetPassword(req,res))
router.patch('/reset-password/:id/:token', (req,res) => authController.resetPassword(req,res));

//protectedRoutes
router.post('/logout', authMiddleware, (req, res) => authController.logoutUser(req, res));
router.get('/profile/:id',authMiddleware, (req,res) => tutorProfileController.displayTutorDetails(req,res));
router.put('/update-profile/:id', (req,res) => tutorProfileController.updateTutorProfileDetails(req,res));
router.patch('/update-image/:id', cloudinaryService.multerUploadImage,(req,res, next) => { next();}, (req,res) => tutorProfileController.updateTutorImage(req,res))
router.post('/tutor-approval/:tutorId', cloudinaryService.multerUpload,(req, res, next) => {next();},(req, res) => tutorController.handleApprovalData(req, res));
router.post('/upload-course/:id', authMiddleware, upload.fields([
    {name: 'videos', maxCount: 12},
    {name:'coverImage', maxCount: 1}
]), (req,res) => manageCourseController.createCourse(req,res));
router.get('/list-course/', authMiddleware, (req,res) => manageCourseController.listCourse(req,res));
router.get('/my-course/:id', authMiddleware, (req,res) => manageCourseController.listMyCourse(req,res));
router.patch('/update-status/:id', authMiddleware, (req,res) => manageCourseController.updateCourseStatus(req,res));
router.get('/get-students/:id', authMiddleware, (req,res) => manageUserController.listEnrolledUser(req,res))


export default router;