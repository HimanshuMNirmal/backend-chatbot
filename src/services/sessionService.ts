import prisma from '../config/database';

export const createOrGetSession = async (sessionId: string, ipAddress?: string, userAgent?: string) => {
    let session = await prisma.session.findUnique({
        where: { sessionId },
    });

    if (!session) {
        try {
            session = await prisma.session.create({
                data: {
                    sessionId,
                    ipAddress,
                    userAgent,
                },
            });
        } catch (error: any) {
            // Handle race condition - session was created by another request
            if (error.code === 'P2002') {
                session = await prisma.session.findUnique({
                    where: { sessionId },
                });
            } else {
                throw error;
            }
        }
    } else {
        session = await prisma.session.update({
            where: { sessionId },
            data: { lastActive: new Date() },
        });
    }

    return session;
};

export const getAllSessions = async () => {
    return await prisma.session.findMany({
        include: {
            messages: {
                orderBy: { timestamp: 'desc' },
                take: 1,
            },
        },
        orderBy: { lastActive: 'desc' },
    });
};

export const getSessionById = async (sessionId: string) => {
    return await prisma.session.findUnique({
        where: { sessionId },
        include: {
            messages: {
                orderBy: { timestamp: 'asc' },
            },
        },
    });
};
