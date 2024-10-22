import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.config';
import { Redis } from 'ioredis';
import { generateAccessAndRefereshTokens, generateOTP } from '../utils/auth.utils';
import sendMail from '../utils/maill.utils';
import { otpTemplate } from '../constants/email.templates';

//  created a redis client for storing OTP's data in the redis memory.
const redisClient = new Redis(process.env.REDIS_DATABASE_URI as string);


const registerUserController = async (request: Request, response: Response) => {
    try {
        const { fullName, email, password, username } = request.body;
        if (!fullName || !email || !password || !username) {
            return response.status(400).json({
                message: 'Please provide all the required fields. (name, email, password, username)',
                success: false,
            });
        }
        if (password.length < 6) {
            return response.status(400).json({
                message: 'Password must be at least 6 characters long.',
                success: false,
            });
        }
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });
        if (existingUser) {
            return response.status(400).json({
                message: 'User with this email or username already exists.',
                success: false,
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
                username
            },
            select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
                createdAt: true,
            }
        });
        return response.status(201).json({
            message: 'User registered successfully.',
            success: true,
            user
        });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while registering the user.',
            success: false,
            error: error.message
        });
    }
};


const loginUserController = async (request: Request, response: Response) => {
    try {
        const { username, email, password } = request.body;
        if (!(username || email) || !password) {
            return response.status(400).json({
                message: 'Please provide all the required fields. (email or username, password)',
                success: false,
            });
        }
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            },
            include: {
                friends: true
            }
        });
        if (!user) {
            return response.status(400).json({
                message: 'User with this email or username does not exist.',
                success: false,
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return response.status(400).json({
                message: 'Invalid login credentials.',
                success: false,
            });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user.id);

        const cookieOptions = {
            httpOnly: true,
            secure: true
        };

        const userData = {
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            profile: user.profile,
            isVerified: user.isVerified,
            about: user.about,
            friends: user.friends,
            createdAt: user.createdAt,
        };

        return response.status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json({
                message: 'User logged in successfully.',
                success: true,
                accessToken,
                refreshToken,
                user: userData
            });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while logging in the user.',
            success: false,
            error: error.message
        });
    }
};


const logoutUserController = async (request: Request, response: Response) => {
    try {
        await prisma.user.update({
            where: {
                // @ts-expect-error
                id: request.userId!
            },
            data: {
                refreshToken: null
            }
        });
        return response.status(200)
            .clearCookie("accessToken",)
            .clearCookie("refreshToken")
            .json({
                message: 'User logged out successfully.',
                success: true,
            });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while logging out the user.',
            success: false,
            error: error.message
        });
    }
};


const refreshAccessTokenController = async (request: Request, response: Response) => {
    try {
        const incomingRefreshToken = request.body.refreshToken || request.cookies.refreshToken;
        if (!incomingRefreshToken) {
            return response.status(404).json({
                message: 'Refresh token not provided.',
                success: false,
            });
        }
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET_REFRESH_TOKEN!) as { userId: string } | null;
        const user = await prisma.user.findFirst({
            where: {
                id: decodedToken?.userId
            },
            include: {
                conversations: {
                    include: {
                        users: {
                            select: {
                                id: true,
                                fullName: true,
                                username: true,
                                email: true,
                                profile: true,
                            }
                        }
                    }
                },
                friends: true
            }
        });

        if (!user) {
            return response.status(401).json({
                message: 'Invalid refresh token request.',
                success: false,
            });
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            return response.status(401).json({
                message: 'Refresh token is expired or used',
                success: false,
            });
        }

        const userData = {
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            profile: user.profile,
            about: user.about,
            conversations: user.conversations,
            friends: user.friends,
            createdAt: user.createdAt,
        };

        const cookieOptions = {
            httpOnly: true,
            secure: true
        };
        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user.id);
        return response.status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json({
                message: 'Access token refreshed',
                success: true,
                accessToken,
                refreshToken,
                user: userData
            });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while refreshing the access token for the user. Please login again to continue.',
            success: false,
            error: error.message
        });
    }
};


const forgetPasswordController = async (request: Request, response: Response) => {
    try {
        const { email, password } = request.body;
        if (!email || !password) {
            return response.status(400).json({
                message: 'Please provide the email address and new password.',
                success: false,
            });
        };
        if (password.length < 6) {
            return response.status(400).json({
                message: 'Password must be at least 6 characters long.',
                success: false,
            });
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                password: hashedPassword
            }
        });
        return response.status(200).json({
            message: 'Password Changed successfully.',
            success: true,
        });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while forgeting the password.',
            success: false,
            error: error.message
        });
    };
};


const sendOtpController = async (request: Request, response: Response) => {
    try {
        const { email, subject } = request.body;
        if (!email) {
            return response.status(400).json({
                message: 'Please provide the email address.',
                success: false,
            });
        }
        const otp = generateOTP();
        const emailPayload = {
            to: email,
            subject: subject,
            html: otpTemplate(otp)
        };
        const { success } = await sendMail(emailPayload);
        if (!success) {
            return response.status(500).json({
                message: 'Error while sending the OTP.',
                success: false
            });
        }
        await redisClient.set(`otp:${email}`, otp);
        await redisClient.expire(`otp:${email}`, 300); // expiring OTP after 5 min
        return response.status(200).json({
            message: 'OTP sent successfully.',
            success: true,
        });
    } catch (error: any) {
        console.log(error);
        return response.status(500).json({
            message: 'Error while sending the OTP.',
            success: false,
            error: error.message
        });
    }
};


const verifyOtpController = async (request: Request, response: Response) => {
    try {
        const { email, otp, userVerify } = request.body;
        if (!email || !otp) {
            return response.status(400).json({
                message: 'Please provide the email address and OTP.',
                success: false,
            });
        }
        const storedOtp = await redisClient.get(`otp:${email}`);
        if (!storedOtp) {
            return response.status(400).json({
                message: 'Invalid OTP.',
                success: false,
            });
        };
        const isValidOTP = storedOtp.toString() === otp.toString();
        if (!isValidOTP) {
            return response.status(400).json({
                message: 'Invalid OTP.',
                success: false,
            });
        }
        if (userVerify) {
            await prisma.user.update({
                where: {
                    email: email
                },
                data: {
                    isVerified: true
                }
            });
        };
        await redisClient.del(`otp:${email}`); // delete the OTP from the redis database.
        return response.status(200).json({
            message: 'Email verified successfully.',
            success: true,
        });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while verifying the OTP.',
            success: false,
            error: error.message
        });
    }
};


export {
    registerUserController,
    loginUserController,
    logoutUserController,
    refreshAccessTokenController,
    forgetPasswordController,
    sendOtpController,
    verifyOtpController,
};