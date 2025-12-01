import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const login = (req: Request, res: Response) => {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@aimbrill.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (email === adminEmail && password === adminPassword) {
        const token = jwt.sign(
            { adminId: 'admin-1' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        return res.json({ token, message: 'Login successful' });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
};

export const verify = (_req: Request, res: Response) => {
    res.json({ valid: true });
};
