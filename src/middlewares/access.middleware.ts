import { Request, Response, NextFunction } from "express";

const hasResorceAccess = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const resorceAccessKey = request.headers['resorce-access-key'];
        if (!resorceAccessKey) {
            return response.status(401).json({
                message: 'Provide `resorce-access-key` in custom header to access API resorces.',
                success: false,
            });
        };
        if (resorceAccessKey.toString() !== process.env.RESORCE_ACCESS_KEY as string) {
            return response.status(401).json({
                message: 'You are not authorized to access API resorces.',
                success: false,
            });
        };
        next();
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while checking for resorce access key.',
            success: false,
            error: error.message
        });
    };
};

export default hasResorceAccess;