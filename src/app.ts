import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
    res.json({ message: 'Chatbot API Server' });
});

app.use('/api/auth', authRoutes);

app.use(errorHandler);

export default app;
