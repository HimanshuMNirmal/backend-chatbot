import { Router } from 'express';
import { getMessagesBySession, markAsRead } from '../controllers/messageController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/:sessionId', getMessagesBySession);
router.patch('/:id', authMiddleware, markAsRead);

export default router;
