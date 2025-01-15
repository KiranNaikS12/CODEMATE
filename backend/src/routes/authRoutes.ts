import express from 'express';
import {authMiddleware} from '../middleware/authMiddleware';
import refreshToken from '../utils/refreshToken';

const router = express.Router();

router.get('/verify-token', authMiddleware, (req,res) => {
    res.status(200).json({message: 'Token is vald'})
})
router.post('/refresh-token', refreshToken)

export default router;