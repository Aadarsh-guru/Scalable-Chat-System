import transporter from "../config/nodemailer.config";

interface SendMailProps {
    from: string;
    to: string;
    subject: string;
    html: string;
};

const sendMail = async ({ from, to, subject, html }: SendMailProps) => {
    try {
        const info = await transporter.sendMail({ from, to, subject, html });
        return { success: true, info: info };
    } catch (error: any) {
        return { success: false, error: error?.message };
    }
}

export default sendMail;