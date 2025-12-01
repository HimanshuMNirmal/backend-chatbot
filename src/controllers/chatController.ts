import { Request, Response } from 'express';
import { getAllSessions, getSessionById, createOrGetSession } from '../services/sessionService';

export const getAllChats = async (_req: Request, res: Response) => {
    try {
        const sessions = await getAllSessions();
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
};

export const getChatById = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const session = await getSessionById(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        return res.json(session);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch chat' });
    }
};

export const createChat = async (req: Request, res: Response) => {
    try {
        const { sessionId, ipAddress, userAgent } = req.body;
        const session = await createOrGetSession(sessionId, ipAddress, userAgent);
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create chat' });
    }
};
