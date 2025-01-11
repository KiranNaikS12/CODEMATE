import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { AuthMessages } from "./message";
import { HttpStatusCode } from "./httpStatusCode";
import { getCookieName, getNewCookieForNewToken, getRefreshCookieName } from "./cookieUtils";
import { Role } from "../types/commonTypes";
import { JwtPayload } from "../types/utilTypes";

const refreshToken = (req: Request, res: Response): Response | void => {
    try {
        const { roleId } = req.body;
        if(!roleId) {
            return res.status(HttpStatusCode.BAD_REQUEST).json(AuthMessages.ROLEID_IS_REQUIRED);
        }

        const refreshCookieName = getRefreshCookieName(roleId as Role);
        const refreshToken = req.cookies[refreshCookieName];
        

        //verifying refreshToken
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!, (err: any, decoded: any) => {
            if (err) {
                return res.status(HttpStatusCode.FORBIDDEN).json({ message: AuthMessages.INVALID_REFRESH_TOKEN });
            }

            const { userId, roleId } = decoded as JwtPayload;

            const newAccessToken = jwt.sign({ userId, roleId } as JwtPayload, process.env.JWT_SECRET!, {
                expiresIn: '15m',
            });

            const cookieName = getCookieName(roleId as Role);
            res.cookie(cookieName, newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1 * 24 * 60 * 60 * 1000
            })
  
            return res.status(HttpStatusCode.Ok).json({ message: 'Access token refreshed successfully' });
        });

    } catch (error) {
        console.error('Error refreshing token:', error);
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: AuthMessages.TOKEN_REFRESH_ERROR });
    }
};

export default refreshToken;