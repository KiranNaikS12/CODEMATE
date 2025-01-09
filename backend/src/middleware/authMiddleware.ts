import jwt from 'jsonwebtoken'
import {Request, Response, NextFunction} from 'express'
import { Role } from '../types/commonTypes';
import { getCookieName } from '../utils/cookieUtils';
import { JwtPayload } from '../types/utilTypes';

export interface JwtPayloads {
    userId: string,
    role:Role;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayloads;
        }
    }
}

const authMiddleware = (req:Request, res:Response, next:NextFunction) => {
    try {
         const roles = Object.values(Role)
         let token: string | undefined;

         for (const role of roles) {
            const cookieName = getCookieName(role);
            if(req.cookies[cookieName]) {
                token = req.cookies[cookieName];
                break;
            }
         }
         
        if (!token) {         
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided from authMiddleware',
                status: 401,
            });
        }
        
         const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayloads;
         req.user = decoded;
         next();

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: 'Token has expired',
                status: 401,
            });
        }
    }
}

const protectRole = (allowedRoles: Role[]) => {
    return async (req:Request, res:Response, next:NextFunction) => {
        try {
            let token;
            
            const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
            for (const role of normalizedAllowedRoles) {
                const cookieName = getCookieName(role as Role);
                if (req.cookies[cookieName]) {
                    token = req.cookies[cookieName];
                    break;
                }
            }

            if(!token) {
                res.status(401).json({
                    success:false, 
                    message:'Not Authorized - No valid token found'})
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET!)  as JwtPayload;

            //Check if the decoded roleId is included in allowed roles
            if (!normalizedAllowedRoles.includes(decoded.roleId.toLowerCase())) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied - Insufficient permissions'
                });
            }

            next();

        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired',
                    status: 401,
                });
            }
            next(error);
        }
    };
};


export { authMiddleware, protectRole}


