import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import dotenv from 'dotenv';
import { initializeSocketHandlers } from './services/socketService';

dotenv.config();

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

initializeSocketHandlers(io);

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
