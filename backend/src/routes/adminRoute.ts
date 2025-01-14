import express from 'express';
import { container } from "../config/di-containers";
import { authMiddleware } from '../middleware/authMiddleware';
import { AdminAuthController } from "../controllers/admin/adminAuthController";
import { ManageUserController } from '../controllers/admin/manageUserController';
import { ManageTutorController } from '../controllers/admin/manageTutorController';
import { ProblemController } from '../controllers/problems/problemsController';
import { CourseController } from '../controllers/course/courseController';

const router = express.Router();
const adminAuthController = container.get<AdminAuthController>('AdminAuthController');
const manageUserController = container.get<ManageUserController>('ManageUserController');
const manageTutorController = container.get<ManageTutorController>('ManageTutorController');
const manageProblemController = container.get<ProblemController>('ProblemController');
const manageCourseController = container.get<CourseController>('CourseController')


router.post('/login', (req,res) => adminAuthController.loginAdmin(req,res));
router.post('/logout', authMiddleware, (req,res) => adminAuthController.logoutAdmin(req,res));
router.get('/listuser',authMiddleware, (req,res) => manageUserController.listUsers(req,res));
router.get('/listtutors',authMiddleware, (req,res) => manageTutorController.listTutors(req,res));
router.patch('/edituser/:id', (req,res) => manageUserController.updateUsers(req,res));
router.patch('/edittutor/:id', (req,res) => manageTutorController.updateTutorStatus(req,res));
router.get('/tutor-detail/:tutorId',authMiddleware, (req,res) => manageTutorController.displayTutorDetails(req,res));
router.post('/tutor-approval/:tutorId', (req,res) => manageTutorController.updateTutorApproval(req,res));
router.get('/user-detail/:userId',authMiddleware, (req,res) => manageUserController.displayUserDetail(req,res));
router.post('/add-problems',(req,res) => manageProblemController.createNewProblem(req,res));
router.get('/list-problems',authMiddleware, (req,res) => manageProblemController.listProblems(req,res));
router.patch('/update-status/:id', authMiddleware, (req,res) => manageProblemController.updateProblemStatus(req,res));
router.get('/list-problem/:id', authMiddleware, (req,res) => manageProblemController.getProblemData(req,res));
router.put('/update-basic/:id', authMiddleware, (req,res) => manageProblemController.updateBasicDetails(req,res));
router.put('/additional-update/:id', authMiddleware, (req,res) => manageProblemController.updateAdditionalProblemDetails(req,res));
router.get('/list-courses', authMiddleware, (req,res) => manageCourseController.listCourse(req,res));
router.get('/get-stats', authMiddleware, (req,res) => adminAuthController.getDashStats(req,res))

export default router;