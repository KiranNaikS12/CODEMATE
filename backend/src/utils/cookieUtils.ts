import { Role } from "../types/commonTypes";
import { Response } from "express";

export const getCookieName = (roleId: Role): string => {
    return `jwt_${roleId}`
}

export const getRefreshCookieName = (roleId: Role): string => {
    return `refresh_jwt_${roleId}`
}

export const getNewCookieForNewToken = (roleId: Role) : string => {
    return `new_jwt${roleId}`
}

export const clearAuthCookie = (res: Response, roleId: Role): void => {
    const cookieName = getCookieName(roleId);
    res.cookie(cookieName, '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    })
}