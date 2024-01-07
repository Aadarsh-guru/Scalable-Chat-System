import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const isLogin = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const token = request.cookies?.accessToken || request.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return response.status(401).json({
                message: 'Please provide a valid token to continue.',
                success: false
            });
        }
        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN!);
            // @ts-expect-error
            request.userId = decodedToken.userId;
            return next();
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                return response.status(401).json({
                    message: 'Token has expired. Please log in again.',
                    success: false
                });
            } else {
                throw error;
            }
        }
    } catch (error: any) {
        return response.status(500).json({
            message: 'You are not logged in. Please log in to continue.',
            success: false,
            error: error.message
        });
    };
};

export default isLogin;