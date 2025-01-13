import { Role } from './commonTypes';

export interface    JwtPayload {
    userId: string,
    roleId: Role,
    otp?: string;
}