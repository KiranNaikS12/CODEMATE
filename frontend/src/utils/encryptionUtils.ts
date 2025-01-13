import CryptoJS from 'crypto-js'

const SECRET_KEY = import.meta.env.VITE_ENCRYPTED_KEY;

export const encryptData = <T>(data: T) : string => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

export const decryptData = <T>(cipherText: string) : T | null => {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))

    } catch (error) {
        console.log('Decryption failed', error);
        return null;
    }
}