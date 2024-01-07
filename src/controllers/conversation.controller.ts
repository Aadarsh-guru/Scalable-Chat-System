import { Request, Response } from 'express';
import prisma from '../config/db.config';
import { deleteMediaFromS3Bucket } from '../utils/media.utils';


const createConversationController = async (request: Request, response: Response) => {
    try {
        const { friendId } = request.body;

        if (!friendId) {
            return response.status(400).json({
                message: 'User Id is required.',
                success: false,
            });
        }

        // @ts-expect-error
        const userId = request.userId;

        const existingConversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { users: { some: { id: userId } } },
                    { users: { some: { id: friendId } } },
                    { isGroup: false }
                ],
            },
            include: {
                users: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        email: true,
                        profile: true,
                        about: true
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
            }
        });

        if (existingConversation) {
            return response.status(200).json({
                message: 'Conversation already exists.',
                success: true,
                conversation: existingConversation
            });
        }

        const newConversation = await prisma.conversation.create({
            data: {
                users: {
                    connect: [
                        { id: userId },
                        { id: friendId },
                    ],
                },
            },
            include: {
                users: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        email: true,
                        profile: true,
                        about: true
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
            }
        });

        //  send an real-time event on create of new conversation

        request.app.get('io').emit('event:add-conversation', newConversation);

        return response.status(200).json({
            message: 'Conversation created successfully.',
            success: true,
            conversation: newConversation
        });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while creating the conversation.',
            success: false,
            error: error.message
        });
    };
};


const getAllConversationsController = async (request: Request, response: Response) => {
    try {
        // @ts-expect-error
        const userId = request.userId
        const conversations = await prisma.conversation.findMany({
            where: {
                users: {
                    some: {
                        id: userId
                    }
                }
            },
            include: {
                users: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        email: true,
                        profile: true,
                        about: true
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
            }
        });
        return response.status(200).json({
            message: 'Conversations fetched successfully.',
            success: true,
            conversations
        });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while fetching the conversations.',
            success: false,
            error: error.message
        });
    };
};


const deleteConversationController = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;

        const mediaMessages = await prisma.message.findMany({
            where: {
                NOT: {
                    messageType: 'TEXT',
                },
            },
        });

        mediaMessages?.forEach(async (message) => {
            message.messageType !== 'TEXT' && await deleteMediaFromS3Bucket(message.body);
        });

        // Delete associated messages first
        await prisma.message.deleteMany({
            where: {
                conversationId: id
            }
        });

        // Now, delete the conversation
        const conversation = await prisma.conversation.delete({
            where: {
                id
            }
        });

        // Send a real-time event on the removal of the conversation

        request.app.get('io').emit('event:remove-conversation', conversation);

        return response.status(200).json({
            message: 'Conversation deleted successfully.',
            success: true,
            conversation
        });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while deleting the conversation.',
            success: false,
            error: error.message
        });
    };
};


const createGroupController = async (request: Request, response: Response) => {
    try {
        const { users, groupName } = request.body as { users: string[], groupName: string };

        if (users?.length < 2 || !groupName) {
            return response.status(400).json({
                message: 'at least 2 users and group name is required to create a group.',
                success: false,
            });
        }

        // @ts-expect-error
        const userId = String(request.userId);
        users?.push(userId);

        const conversation = await prisma.conversation.create({
            data: {
                groupName: groupName,
                isGroup: true,
                groupAdminId: userId,
                users: {
                    connect: users.map(id => ({ id })),
                },
            },
            include: {
                users: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        email: true,
                        profile: true,
                        about: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });

        // Send a real-time event on the creation of a new group
        request.app.get('io').emit('event:add-conversation', conversation);

        return response.status(200).json({
            message: 'Group created successfully.',
            success: true,
            conversation,
        });
    } catch (error: any) {
        console.log(error);
        return response.status(500).json({
            message: 'Error while creating the group.',
            success: false,
            error: error.message,
        });
    }
};


const leaveGroupController = async (request: Request, response: Response) => {
    try {
        const { conversationId } = request.body;
        if (!conversationId) {
            return response.status(400).json({
                message: 'Conversation Id is required.',
                success: false
            });
        }
        // @ts-expect-error
        const userId = request.userId;

        const conversation = await prisma.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                users: {
                    disconnect: {
                        id: userId
                    }
                }
            }
        });

        return response.status(200).json({
            message: 'Leaved from the group successfully.',
            success: true,
            conversation
        });
    } catch (error: any) {
        console.log(error);
        return response.status(500).json({
            message: 'Error while leaving from the group.',
            success: false,
            error: error.message,
        });
    }
};


const removeUserFromTheGroupController = async (request: Request, response: Response) => {
    try {
        const { conversationId, userId } = request.body;
        if (!conversationId || !userId) {
            return response.status(400).json({
                message: 'Conversation Id and User Id are required.',
                success: false
            });
        }

        const conversation = await prisma.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                users: {
                    disconnect: {
                        id: userId
                    }
                }
            }
        });

        //  send an real-time event on remove from the group
        request.app.get('io').emit('event:remove-user', { conversation, userId });

        return response.status(200).json({
            message: 'User removed from the group successfully.',
            success: true,
            conversation
        });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while removing the user from the group.',
            success: false,
            error: error.message,
        });
    }
};


const addUserToTheGroupController = async (request: Request, response: Response) => {
    try {
        const { conversationId, userId } = request.body;
        if (!conversationId || !userId) {
            return response.status(400).json({
                message: 'Conversation Id and User Id are required.',
                success: false
            });
        }

        const conversation = await prisma.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                users: {
                    connect: {
                        id: userId
                    }
                }
            },
            include: {
                users: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        email: true,
                        profile: true,
                        about: true
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
            }
        });

        //  send an real-time event on add in a new group
        request.app.get('io').emit('event:add-user', conversation);

        return response.status(200).json({
            message: 'User added in the group successfully.',
            success: true,
            newConversation: conversation
        });
    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while adding the user to the group.',
            success: false,
            error: error.message
        });
    }
};


const updateGroupInfoController = async (request: Request, response: Response) => {
    try {
        const { groupName, groupAbout, groupProfile } = request.body;

        if (!groupName) {
            return response.status(400).json({
                message: 'Group name is required.',
                success: false
            });
        }

        const conversationId = request.params.id;

        if (groupProfile) {
            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId
                }
            });
            if (conversation?.groupProfile) {
                await deleteMediaFromS3Bucket(conversation.groupProfile);
            }
        };

        const conversation = await prisma.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                groupName,
                groupAbout,
                groupProfile
            },
            include: {
                users: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        email: true,
                        profile: true,
                        about: true
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
            }
        });

        return response.status(200).json({
            message: 'Group info updated successfully.',
            success: true,
            newConversation: conversation
        });

    } catch (error: any) {
        return response.status(500).json({
            message: 'Error while removing the user from the group.',
            success: false,
            error: error.message,
        });
    }
};


export {
    createConversationController,
    getAllConversationsController,
    deleteConversationController,
    createGroupController,
    leaveGroupController,
    removeUserFromTheGroupController,
    updateGroupInfoController,
    addUserToTheGroupController,
};