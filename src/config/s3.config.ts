import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.AWS_S3_BUCKET_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
});

export const s3BucketName = process.env.AWS_S3_BUCKET_NAME as string;
export const s3PrefixFolderName = process.env.AWS_S3_PREFIX_FOLDER_NAME as string;

export default s3Client; 