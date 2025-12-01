import { Request, Response } from 'express';
import prisma from '../config/database';

export const getMessagesBySession = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const messages = await prisma.message.findMany({
            where: { sessionId },
            orderBy: { timestamp: 'asc' },
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const message = await prisma.message.update({
            where: { id },
            data: { isRead: true },
        });
        res.json(message);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update message' });
    }
};
