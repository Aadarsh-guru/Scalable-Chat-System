import { Request, Response } from 'express';
import prisma from '../config/db.config';
import bcrypt from 'bcryptjs';
import { deleteMediaFromS3Bucket } from '../utils/media.utils';


const getCurrentUserController = async (request: Request, response: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                // @ts-expect-error
                id: request.userId
            }
        });
        if (!user) {
            return response.status(401).json({
                message: 'Unauthorized request.',
                success: false
            });
        }
        return response.status(200).json({
            message: 'User fetched successfully.',
            success: true,
            user
        });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while fetching the user.',
            success: false,
            error: error.message
        });
    }
};


const updateUserController = async (request: Request, response: Response) => {
    try {
        const { fullName, username, about, profile } = request.body;

        if (username) {
            const existingUserWithNewUsername = await prisma.user.findUnique({
                where: {
                    username
                }
            });

            if (existingUserWithNewUsername) {
                return response.status(400).json({
                    message: 'Username not avalible.',
                    success: false
                });
            }
        }

        if (profile) {
            const user = await prisma.user.findFirst({
                where: {
                    // @ts-expect-error
                    id: request.userId
                }
            });
            if (user?.profile) {
                await deleteMediaFromS3Bucket(user.profile);
            }
        }

        const updatedUser = await prisma.user.update({
            where: {
                // @ts-expect-error
                id: request.userId
            },
            data: {
                fullName,
                username,
                about,
                profile
            },
            include: {
                friends: true,
            }
        });

        const userData = {
            id: updatedUser.id,
            fullName: updatedUser.fullName,
            username: updatedUser.username,
            email: updatedUser.email,
            profile: updatedUser.profile,
            about: updatedUser.about,
            friends: updatedUser.friends,
            createdAt: updatedUser.createdAt,
        }

        return response.status(200).json({
            message: 'User updated successfully.',
            success: true,
            user: userData
        });
    } catch (error: any) {

        return response.status(500).json({
            message: 'Error while updating the user.',
            success: false,
            error: error.message
        });
    }
};


const updateUserPasswordController = async (request: Request, response: Response) => {
    try {
        const { password, newPassword } = request.body;

        if (!password || !newPassword) {
            return response.status(400).json({
                message: 'Password and new password are required.',
                success: false
            });
        }

        if (newPassword.length < 6) {
            return response.status(400).json({
                message: 'New password must be at least 6 characters long.',
                success: false
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                // @ts-expect-error
                id: request.userId
            }
        });

        if (!user) {
            return response.status(401).json({
                message: 'Unauthorized request.',
                success: false
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return response.status(400).json({
                message: 'Invalid password.',
                success: false
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: {
                // @ts-expect-error
                id: request.userId
            },
            data: {
                password: hashedPassword
            }
        });
        return response.status(200).json({
            message: 'User password updated successfully.',
            success: true,
        });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while updating the user password.',
            success: false,
            error: error.message
        });
    }
};


const deleteUserAccountController = async (request: Request, response: Response) => {
    try {
        const { password } = request.body;
        if (!password) {
            return response.status(400).json({
                message: 'Password is required.',
                success: false
            });
        }
        const user = await prisma.user.findUnique({
            where: {
                // @ts-expect-error
                id: request.userId
            }
        });
        if (!user) {
            return response.status(401).json({
                message: 'Unauthorized request.',
                success: false
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return response.status(400).json({
                message: 'Invalid password.',
                success: false
            })
        }
        if (user?.profile) {
            await deleteMediaFromS3Bucket(user.profile);
        }
        const deletedUser = await prisma.user.delete({
            where: {
                id: user.id
            }
        });
        return response.status(200).json({
            message: 'User account deleted successfully.',
            success: true,
            user: deletedUser
        });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while deleting the user account.',
            success: false,
            error: error.message
        });
    };
};


const searchUsersController = async (request: Request, response: Response) => {
    try {
        const { query } = request.query;
        if (!query) {
            return response.status(400).json({
                message: 'Search query is required.',
                success: false
            });
        }
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        fullName: {
                            contains: query.toString(),
                            mode: 'insensitive'
                        }
                    },
                    {
                        username: {
                            contains: query.toString(),
                            mode: 'insensitive'
                        }
                    }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                fullName: true,
                username: true,
                profile: true,
                about: true,
                email: true
            }
        });
        return response.status(200).json({
            message: 'Users fetched successfully.',
            success: true,
            users
        });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while fetching the users.',
            success: false,
            error: error.message
        });
    }
};


const addFriendController = async (request: Request, response: Response) => {
    try {
        const { fullName, username, email, friendId, profile, about } = request.body;
        if (!fullName || !username || !email || !friendId) {
            return response.status(400).json({
                message: 'All fields are required. (fullName, username, email, friendId)',
                success: false
            });
        }
        const alreadyFriend = await prisma.friend.findFirst({
            where: {
                AND: [
                    // @ts-expect-error
                    { userId: request.userId },
                    { friendId: friendId }
                ]
            }
        })
        if (alreadyFriend) {
            return response.status(400).json({
                message: 'User is already in your friend list.',
                success: false
            });
        }
        const friend = await prisma.friend.create({
            data: {
                fullName,
                email,
                username,
                profile,
                about,
                // @ts-expect-error
                userId: request.userId,
                friendId
            },
            select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
                profile: true,
                about: true,
                userId: true,
                friendId: true
            }
        });
        return response.status(200).json({
            message: 'Friend added successfully.',
            success: true,
            friend
        });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while adding the friend.',
            success: false,
            error: error.message
        });
    }
};


const removeFriendController = async (request: Request, response: Response) => {
    try {
        const { id } = request.body;
        if (!id) {
            return response.status(400).json({
                message: 'id is required.',
                success: false
            });
        }
        const friend = await prisma.friend.delete({
            where: {
                id
            },
            select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
                profile: true,
                about: true,
                userId: true,
                friendId: true
            }
        });
        return response.status(200).json({
            message: 'Friend removed successfully.',
            success: true,
            friend
        });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while removing the friend.',
            success: false,
            error: error.message
        });
    }
};


export {
    deleteUserAccountController,
    getCurrentUserController,
    updateUserController,
    updateUserPasswordController,
    searchUsersController,
    addFriendController,
    removeFriendController,
};