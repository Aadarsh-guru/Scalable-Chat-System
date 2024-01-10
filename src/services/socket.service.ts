import cookie from "cookie";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { CreateMessageType } from "../types";
import { Redis } from "ioredis";
import { produceMessage } from "./kafka.service";


const initializeSocketIo = (io: Server) => {

    const redisClient = new Redis(process.env.REDIS_DATABASE_URI as string);
    const publisher = new Redis(process.env.REDIS_DATABASE_URI as string);
    const subscriber = new Redis(process.env.REDIS_DATABASE_URI as string);

    // subscribe to the redis messages publish channel
    subscriber.subscribe("messages");

    // listen to the redis messages publish channel and emit the message to the client
    subscriber.on('message', async (channel, message) => {
        if (channel === "messages") {
            io.emit('event:receive-message', JSON.parse(message));
        };
    });

    return io.on("connection", async (socket) => {
        try {
            // auth logic
            const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
            let accessToken = cookies?.accessToken;
            if (!accessToken) {
                accessToken = socket.handshake.auth?.accessToken;
            }
            if (!accessToken) {
                throw new Error("Unauthorized: Missing access token");
            }
            const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET_ACCESS_TOKEN!) as { userId: string } | null;
            if (!decodedToken) {
                return new Error("Unauthorized: Invalid access token");
            }
            const userId = decodedToken.userId;

            if (userId) {
                await redisClient.set(`user:${userId}`, socket.id);
            };

            io.emit(`event:${userId}-connected`, { isOnline: true });

            socket.on('event:check-online', async ({ userId }: { userId: string }) => {
                const hasUser = await redisClient.get(`user:${userId}`);
                socket.emit('event:online-status', { isOnline: hasUser !== null ? true : false });
            });

            socket.on('event:send-message', async ({ body, senderId, conversationId, messageType }: CreateMessageType) => {
                const messagePayload = {
                    id: uuid(),
                    body,
                    senderId,
                    conversationId,
                    messageType,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
                await publisher.publish("messages", JSON.stringify(messagePayload));
                await produceMessage(messagePayload);
            });

            socket.on('event:typing', ({ conversationId, userId }: { conversationId: string, userId: string }) => {
                io.emit(`event:typing-${conversationId}`, { conversationId, userId });
            });

            socket.on('disconnect', async () => {
                await redisClient.del(`user:${userId}`);
                io.emit(`event:${userId}-disconnected`, { isOnline: false });
            });

        } catch (error: any) {
            socket.emit(
                'socket:error',
                error?.message || "Something went wrong while connecting to the socket."
            );
            return socket.disconnect(true);
        };
    });
};

export default initializeSocketIo;
