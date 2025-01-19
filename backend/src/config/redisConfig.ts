import { IRedisConfig } from "../types/redis.config";
import dotenv from 'dotenv';

dotenv.config()

export const redisConfig: IRedisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379')
}