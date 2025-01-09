import jwt from "jsonwebtoken";
import { Response } from "express";
import { Role } from "../types/commonTypes";
import { JwtPayload } from '../types/utilTypes';
import { AuthMessages } from "./message";
import { getCookieName, getRefreshCookieName } from "./cookieUtils";


const generateToken = async (res: Response, userId: string, roleId: Role): Promise<void> => {
    try {
        if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
            throw new Error(AuthMessages.UNDEFINED_ACCESS_AND_REFRESH);
        }

        const token = jwt.sign({ userId, roleId } as JwtPayload, process.env.JWT_SECRET, {
            expiresIn: '5m',
        });

        const refreshToken = jwt.sign({userId, roleId} as JwtPayload, process.env.JWT_REFRESH_SECRET, {
            expiresIn:'7d'
        });

        const cookieName = getCookieName(roleId);
        const refreshCookieName = getRefreshCookieName(roleId as Role);
       
        res.cookie(cookieName, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        });

        res.cookie(refreshCookieName, refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        console.log('Access token generated and set in cookie',refreshCookieName);
        console.log('Access token generated and set in cookie',cookieName);
             
    } catch (error) {
        console.error('Error generating token:', error);
        throw error;
    }
}

export default generateToken;



