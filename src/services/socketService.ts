import { Server, Socket } from 'socket.io';
import prisma from '../config/database';
import { createOrGetSession } from './sessionService';
import aiService from './aiService';

export const initializeSocketHandlers = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        // Handle user joining a chat session
        // Creates/retrieves session in DB and joins the socket to a room for targeted messaging
        socket.on('user-connected', async (data: { sessionId: string; ipAddress?: string; userAgent?: string }) => {
            const { sessionId, ipAddress, userAgent } = data;
            await createOrGetSession(sessionId, ipAddress, userAgent);
            socket.join(sessionId); // Join room to receive admin replies for this session
            console.log(`User ${sessionId} joined room`);
        });

        // Handle incoming user messages
        // Saves message to DB, broadcasts to all admins, and confirms receipt to sender
        socket.on('user-message', async (data: { sessionId: string; message: string; timestamp: string }) => {
            const { sessionId, message, timestamp } = data;

            // Ensure session exists before creating message (prevents foreign key constraint error)
            await createOrGetSession(sessionId);

            const newMessage = await prisma.message.create({
                data: {
                    sessionId,
                    message,
                    senderType: 'user',
                    timestamp: new Date(timestamp),
                },
            });

            // Broadcast to all connected clients (admins will see this in their dashboard)
            io.emit('user-message', newMessage);

            // Send confirmation back to the sender
            socket.emit('message-received', { id: newMessage.id });

            // Check if session has been handed off to admin
            const session = await prisma.session.findUnique({
                where: { sessionId },
            });

            // Only generate AI response if:
            // 1. AI is enabled
            // 2. Session has NOT been handed off to admin
            // 3. Message doesn't contain handoff request phrases
            const wantsHuman = /(talk|speak|chat|connect|wanna|want|need).*(human|agent|person|support|representative|someone)|customer support|real person|live (chat|support|agent)/i.test(message);

            const aiConfig = await aiService.getConfig();
            if (aiConfig.isEnabled && !session?.handedOffToAdmin && !wantsHuman) {
                // Emit AI thinking indicator
                io.to(sessionId).emit('ai-thinking', { sessionId, isThinking: true });

                // Generate AI response asynchronously
                try {
                    const aiResponse = await aiService.generateResponse(sessionId, message);

                    if (aiResponse.content && !aiResponse.error) {
                        // Save AI response to database
                        const aiMessage = await prisma.message.create({
                            data: {
                                sessionId,
                                message: aiResponse.content,
                                senderType: 'ai',
                                timestamp: new Date(),
                            },
                        });

                        // Send AI response to user
                        io.to(sessionId).emit('ai-reply', aiMessage);

                        // Notify admins about new AI message
                        io.emit('chat-list-update');
                    } else {
                        console.error('AI response error:', aiResponse.error);
                    }
                } catch (error) {
                    console.error('Error generating AI response:', error);
                } finally {
                    // Stop AI thinking indicator
                    io.to(sessionId).emit('ai-thinking', { sessionId, isThinking: false });
                }
            } else if (wantsHuman) {
                // User requested human support - hand off to admin
                await prisma.session.update({
                    where: { sessionId },
                    data: { handedOffToAdmin: true },
                });

                // Notify admins that user wants human support
                io.emit('handoff-requested', { sessionId });

                // Notify user that they're being connected to support
                const handoffMessage = await prisma.message.create({
                    data: {
                        sessionId,
                        message: 'Connecting you to our support team...',
                        senderType: 'ai',
                        timestamp: new Date(),
                    },
                });
                io.to(sessionId).emit('ai-reply', handoffMessage);
            }
        });

        // Handle admin replies
        // Saves message to DB and sends only to the specific user's room
        // Also marks session as handed off to admin (AI will stop responding)
        socket.on('admin-reply', async (data: { sessionId: string; message: string; timestamp: string }) => {
            const { sessionId, message, timestamp } = data;

            // Ensure session exists before creating message (prevents foreign key constraint error)
            await createOrGetSession(sessionId);

            const newMessage = await prisma.message.create({
                data: {
                    sessionId,
                    message,
                    senderType: 'admin',
                    timestamp: new Date(timestamp),
                },
            });

            // Mark session as handed off to admin (AI will no longer respond)
            await prisma.session.update({
                where: { sessionId },
                data: { handedOffToAdmin: true },
            });

            // Send reply only to the specific user session room
            io.to(sessionId).emit('admin-reply', newMessage);

            // Notify all admins to refresh their chat list
            io.emit('chat-list-update');
        });

        // Broadcast user typing indicator to all admins
        socket.on('user-typing', (data: { sessionId: string; isTyping: boolean }) => {
            io.emit('user-typing', data);
        });

        // Send admin typing indicator only to specific user session
        socket.on('admin-typing', (data: { sessionId: string; isTyping: boolean }) => {
            io.to(data.sessionId).emit('admin-typing', data);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
