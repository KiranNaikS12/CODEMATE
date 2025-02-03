import { Redis} from 'ioredis';
import jwt from "jsonwebtoken";
import { CustomError } from "../../utils/customError";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { AuthMessages } from "../../utils/message";
import { inject, injectable } from 'inversify';
import { IRedisConfig, TYPES } from '../../types/redis.config';
import { ITokenBlacklistService } from './ITokenBlacklistService';


interface DecodedToken {
    userId: string;
    roleId: string;
    iat: number; // issued at timestamp
    exp: number; // expiration timestamp
}

@injectable()
export class TokenBlacklistService implements ITokenBlacklistService {
    private redis: Redis;
    private readonly KEY_PREFIX = 'blacklisted_token'

    constructor(
        @inject(TYPES.RedisConfig) redisConfig: IRedisConfig
    ) {
        this.redis = new Redis(redisConfig)
    }

    //adding token to the blacklist
    async addToBlacklist(token: string): Promise<void> {
        try {
            const decoded = jwt.decode(token) as DecodedToken;
            if (!decoded || !decoded.exp) {
                throw new CustomError(AuthMessages.INVALID_TOKEN, HttpStatusCode.BAD_REQUEST);
            }
            
            const ttl = (decoded.exp * 1000) - Date.now();
            if(ttl <= 0) {
                throw new CustomError(AuthMessages.TOKEN_EXPIRED, HttpStatusCode.BAD_REQUEST)
            }
            
            const blacklisted = await this.redis.set(
                `${this.KEY_PREFIX}${token}`,
                `1`,
                'PX',
                ttl
            ) 
        } catch (error) {
            throw new CustomError(AuthMessages.ERROR_BLACKLISTING_TOKEN, HttpStatusCode.BAD_REQUEST);
        }
    }

    //To check if token exists in blacklist
    async isBlacklisted(token: string): Promise<boolean> {
        try{
            const exists = await this.redis.exists(`${this.KEY_PREFIX}${token}`)
            return exists === 1;
        } catch (error) {
            return true;
        }
    }

    //redis handles automatic clean up
    async cleanup(): Promise<void> {
        await this.redis.quit();
    }
    
}