
export interface ITokenBlacklistService {
    addToBlacklist(token: string): Promise<void>;
    isBlacklisted(token: string): Promise<boolean>;
    cleanup(): Promise<void>
}
