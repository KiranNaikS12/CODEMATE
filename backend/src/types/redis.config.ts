

export interface IRedisConfig {
    host: string,
    port: number
}

export const TYPES = {
    RedisConfig: Symbol.for('RedisConfig'),
    TokenBlacklistService: Symbol.for('TokenBlacklistService')
}
