import { MessageTypes } from "@prisma/client";

type CreateMessageType = {
    id: string;
    body: string;
    senderId: string;
    messageType: MessageTypes;
    conversationId: string;
};

export {
    CreateMessageType,
};