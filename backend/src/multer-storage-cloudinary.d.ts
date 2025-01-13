declare module 'multer-storage-cloudinary' {
    import { StorageEngine } from 'multer';
    import { v2 as cloudinary } from 'cloudinary';

    export interface cloudinaryParams {
        folder?: string;
        format?: string | ((req: any, file: any) => Promise<string> | string);
        public_id?: (req: Express.Request, file: Express.Multer.File) => string;
        resource_type?: string; 
    }

    interface Options {
        cloudinary: typeof cloudinary;
        params: cloudinaryParams;
    }

    export class CloudinaryStorage implements StorageEngine {
        constructor(options: Options);
        _handleFile(req: Express.Request, file: Express.Multer.File, cb: any): void;
        _removeFile(req: Express.Request, file: Express.Multer.File, cb: any): void;
    }
}