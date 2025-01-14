import AWS from 'aws-sdk';

AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY as string,
    secretAccessKey: process.env.S3_SECERET_KEY as string,
    region: process.env.S3_REGION_KEY as string
});

const s3 = new AWS.S3();

//function to uploadFile to s3
export const uploadToS3 = async (
    file: Express.Multer.File, bucketName: string, key: string
) => {
    const params = {
        Bucket:bucketName,
        Key:key,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    try {
        await s3.upload(params).promise();
        return key; // Return only the key instead of the URL, for storing in the database...
    } catch (err) {
        console.log('Error uploading file to s3',err);
        throw err;
    }
}

export const getSignedUrl = async(
    bucketName: string, key: string, expiresIn: number = 3600
) : Promise<string> => {

    const params = {
        Bucket: bucketName,
        Key: key,
        Expires: expiresIn
    };

    try {
        return await s3.getSignedUrlPromise('getObject', params)
    } catch (error) {
        console.log('Error generating signed URL', error);
        throw error; 
    }
}

