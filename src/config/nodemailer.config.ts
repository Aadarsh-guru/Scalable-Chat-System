import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_MAIL_USER_ID as string,
        pass: process.env.GMAIL_MAIL_USER_PASSWORD as string
    },
});

export default transporter;