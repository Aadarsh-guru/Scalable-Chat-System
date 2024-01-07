import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client, { s3BucketName } from '../config/s3.config';

const deleteMediaFromS3Bucket = async (url: string) => {
    try {
        if (!url.startsWith(`https://${s3BucketName}.s3.amazonaws.com/`)) {
            return { success: true }
        };
        const key = url.replace(`https://${s3BucketName}.s3.amazonaws.com/`, '');
        await s3Client.send(new DeleteObjectCommand({
            Key: key,
            Bucket: s3BucketName
        }));
        return { success: true };
    } catch (error) {
        return { success: false, error };
    };
};


export {
    deleteMediaFromS3Bucket,
};