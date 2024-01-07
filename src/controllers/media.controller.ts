import { Request, Response } from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client, { s3BucketName, s3PrefixFolderName } from '../config/s3.config';

const uploadMediaController = async (request: Request, response: Response) => {
    try {
        const { filename, ref } = request.body;
        if (!filename) {
            return response.status(400).json({
                message: 'media upload filename is required.',
                success: false,
            });
        }
        const key = `${s3PrefixFolderName ? s3PrefixFolderName : ''}/${ref ? ref : ''}/${Date.now()}-${filename}`
        const putCommand = new PutObjectCommand({ Bucket: s3BucketName, Key: key });
        const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 600 });
        const mediaUrl = `https://${s3BucketName}.s3.amazonaws.com/${key}`;
        return response.status(200).json({
            message: 'presiged url generated successfully.',
            success: true,
            uploadUrl,
            mediaUrl
        });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while uploading the media.',
            success: false,
            error: error.message
        });
    };
};


export {
    uploadMediaController,
};