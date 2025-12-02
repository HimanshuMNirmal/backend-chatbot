import { Router } from 'express';
import { getAIConfig, updateAIConfig, toggleAI, testAIResponse } from '../controllers/aiController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Get AI configuration
router.get('/config', authMiddleware, getAIConfig);

// Update AI configuration
router.put('/config', authMiddleware, updateAIConfig);

// Toggle AI on/off
router.post('/toggle', authMiddleware, toggleAI);

// Test AI response (for debugging)
router.post('/test', authMiddleware, testAIResponse);

export default router;
