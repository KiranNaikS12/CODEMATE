import bcrypt from 'bcryptjs'
import { injectable } from 'inversify';
import { IHashService } from './IHashService';

@injectable()
export class HashService implements IHashService {
    private readonly SALT_ROUNDS = 10;

    async hash(password: string): Promise<string> {
        if (!password) {
            throw new Error('Password is required for hashing');
        }
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }

    async compare(password: string, hashedPassword: string): Promise<boolean> {
        if (!password || !hashedPassword) {
            throw new Error('Both password and hashedPassword are required for comparison');
        }
        return bcrypt.compare(password, hashedPassword);
    }
}