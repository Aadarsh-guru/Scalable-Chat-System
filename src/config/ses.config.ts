import { SESClient } from "@aws-sdk/client-ses";

// Initialize the SES client
const sesClient = new SESClient({
    region: process.env.AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
});

export default sesClient;