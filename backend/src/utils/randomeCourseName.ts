import crypto from 'crypto';

export const randomStrings = (bytes = 8) => crypto.randomBytes(bytes).toString('hex')