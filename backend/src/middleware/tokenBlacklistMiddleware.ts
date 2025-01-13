import { Request, Response, NextFunction} from 'express';
import { TokenBlacklistService } from '../services/tokenService/tokenBlacklist';
import { Role } from '../types/commonTypes';
import { getCookieName } from '../utils/cookieUtils';

export const checkBlacklistedToekn = (blacklistService: TokenBlacklistService) => {
    return async(req:Request, res:Response, next:NextFunction) => {
        try {
            const roleFormateRoute = req.originalUrl.includes('/tutors') ? Role.Tutor : Role.User;
            const cookieName = getCookieName(roleFormateRoute);
            const token = req.cookies[cookieName];

            if(!token){
                return next();
            }

            const isBlacklisted = await blacklistService.isBlacklisted(token);
            if(isBlacklisted) {
                console.log(`Token for ${roleFormateRoute} is blacklisted, access denied`);
                return res.status(401).json({success:false, message:'This token has been invalidated.Please login agian'})
            }
            next();
        } catch(error) {
            console.log('Error in blaclist middleware', error)
            next(error);
        }
    }
}