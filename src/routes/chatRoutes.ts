import { Router } from 'express';
import { getAllChats, getChatById, createChat } from '../controllers/chatController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware, getAllChats);
router.get('/:sessionId', authMiddleware, getChatById);
router.post('/', createChat);

export default router;
