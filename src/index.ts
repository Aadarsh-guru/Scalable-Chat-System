import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import cookieParser from "cookie-parser";
import { Server } from 'socket.io';
import initializeSocketIo from './services/socket.service';
import hasResorceAccess from './middlewares/access.middleware';

// dotenv configuration
dotenv.config({
    path: './.env'
});

// constants declaration
const app = express();
const PORT = Number(process.env.PORT) || 8000;
const httpServer = http.createServer(app);

// socket server initialised.
const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.CORS_ORIGIN as string,
        credentials: true
    }
});

// mount the `io` instance on the app
app.set("io", io);

// middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN as string,
    credentials: true
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(morgan('dev'));

// serving static assets
app.use(express.static('public'));

//routes import
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import mediaRoutes from './routes/media.routes';
import conversationRoutes from './routes/conversation.routes';

//routes declaration
app.use("/api/v1/auth", hasResorceAccess, authRoutes);
app.use("/api/v1/users", hasResorceAccess, userRoutes);
app.use("/api/v1/media", hasResorceAccess, mediaRoutes);
app.use("/api/v1/conversations", hasResorceAccess, conversationRoutes);

// initial route 
app.get('/', (_, res) => res.status(200).json({
    message: `Server is operating smoothly.`,
    success: true
}));

// initialised socket server listening
initializeSocketIo(io);

// import message kafka message consumer
import { startMessageConsumer } from './services/kafka.service';

// start consuming messages from the kafka consumer.
startMessageConsumer();

// listening server
httpServer.listen(PORT, () =>
    console.log(`server is running on port ${PORT}!`)
);
