import { SendEmailCommand } from "@aws-sdk/client-ses";
import sesClient from "../config/ses.config";

interface SendMailProps {
    to: string;
    subject: string;
    html: string;
};

const sendMail = async ({ to, subject, html }: SendMailProps) => {
    try {
        const params = {
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Body: {
                    Html: {
                        Data: html,
                    },
                },
                Subject: { Data: subject },
            },
            Source: process.env.ADMIN_EMAIL_ADDRESS as string,
        };
        const command = new SendEmailCommand(params);
        const info = await sesClient.send(command);
        return { success: true, info: info };
    } catch (error: any) {
        return { success: false, error: error?.message };
    }
};

export default sendMail;