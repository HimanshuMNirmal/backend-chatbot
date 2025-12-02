import { Request, Response } from 'express';
import aiService from '../services/aiService';

export const getAIConfig = async (_req: Request, res: Response) => {
    try {
        const config = await aiService.getConfig();
        res.json(config);
    } catch (error) {
        console.error('Error fetching AI config:', error);
        res.status(500).json({ error: 'Failed to fetch AI configuration' });
    }
};

export const updateAIConfig = async (req: Request, res: Response) => {
    try {
        const updates = req.body;
        const config = await aiService.updateConfig(updates);
        res.json(config);
    } catch (error) {
        console.error('Error updating AI config:', error);
        res.status(500).json({ error: 'Failed to update AI configuration' });
    }
};

export const toggleAI = async (req: Request, res: Response) => {
    try {
        const { isEnabled } = req.body;
        const config = await aiService.updateConfig({ isEnabled });
        res.json(config);
    } catch (error) {
        console.error('Error toggling AI:', error);
        res.status(500).json({ error: 'Failed to toggle AI' });
    }
};

export const testAIResponse = async (req: Request, res: Response) => {
    try {
        const { sessionId, message } = req.body;

        if (!sessionId || !message) {
            return res.status(400).json({ error: 'sessionId and message are required' });
        }

        const response = await aiService.generateResponse(sessionId, message);

        if (response.error) {
            return res.status(500).json({ error: response.error });
        }

        return res.json({ response: response.content });
    } catch (error) {
        console.error('Error testing AI response:', error);
        return res.status(500).json({ error: 'Failed to generate AI response' });
    }
};
