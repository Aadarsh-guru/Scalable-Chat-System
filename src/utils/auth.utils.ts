import jwt from 'jsonwebtoken';
import prisma from "../config/db.config";

// utility fuction to generate access and refresh tokens
const generateAccessAndRefereshTokens = async (userId: string) => {
    try {
        const accessToken = await jwt.sign({ userId }, process.env.JWT_SECRET_ACCESS_TOKEN!, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY as string
        });
        const refreshToken = await jwt.sign({ userId }, process.env.JWT_SECRET_REFRESH_TOKEN!, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY as string
        });
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                refreshToken
            }
        });
        return { accessToken, refreshToken }
    } catch (error) {
        throw error;
    }
};


// utility fuction for generating OTP.
const generateOTP = () => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits[randomIndex];
    }
    return otp;
};


export {
    generateAccessAndRefereshTokens,
    generateOTP,
};