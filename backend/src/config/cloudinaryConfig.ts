import { v2 as cloudinary } from 'cloudinary';
import { injectable } from 'inversify';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';


// Cloudinary configuration...
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

// Multer storage configuration with Cloudinary
const certificateStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'tutor-certificates' as string,
        format: async () => 'pdf', 
        public_id: (req: Express.Request, file: Express.Multer.File) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return file.fieldname + '-' + uniqueSuffix; 
        },
    } as any,
});

const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder:'user-images',
        format: async() => 'jpeg',
        public_id: (req:Express.Request, file: Express.Multer.File) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return file.filename + '-' + uniqueSuffix;
        }
    } as any,
})


// Multer instance with Cloudinary storage...
const upload = multer({ storage: certificateStorage });
const uploadImage = multer({storage:imageStorage})


@injectable()
export class CloudinaryService {
    async uploadFile(file: Express.Multer.File, isImage: boolean): Promise<string> {
        if (file.path && file.path.startsWith('http')) {
            // console.log('File already uploaded, returning existing URL:', file.path);
            return file.path;
          }
      
       return new Promise((resolve, reject) => {
        const resource_type = isImage ? 'image' : 'raw'
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'raw', folder: isImage ? 'user-image' : 'tutor-certificate'},
            (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                return reject(error);
            }
            if (!result) {
                return reject(new Error('Upload failed, no result returned'));
            }
            // console.log('Cloudinary upload result:', result);
            resolve(result.secure_url); 
        });

        uploadStream.end(file.buffer);
       });
    }
    get multerUpload() {
        return upload.single('certificate'); 
    }

    get multerUploadImage() {
        return uploadImage.single('image')
    }
}