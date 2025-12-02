# Backend - Real-Time Chatbot Server

This is the backend server for my chatbot system. It handles all the real-time messaging, database operations, and admin authentication.

## What I Used

**Core Stack:**
- Node.js + Express for the API server
- Socket.IO for real-time bidirectional communication
- PostgreSQL as the database (because it's reliable and I'm familiar with it)
- Prisma ORM (makes database queries so much easier and type-safe)
- TypeScript throughout (caught so many bugs during development!)

## Getting Started

### What You'll Need

- Node.js v18+ installed
- A PostgreSQL database running (I used a local instance during development)
- npm or yarn

### Installation Steps

1. First, install all the dependencies:
```bash
npm install
```

2. Create your `.env` file and configure it:
```bash
# I don't have a .env.example yet, but here's what you need:
DATABASE_URL="postgresql://user:password@localhost:5432/chatbot_db"
JWT_SECRET="your-secret-key-here"
ADMIN_EMAIL="admin@aimbrill.com"
ADMIN_PASSWORD="admin123"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
```

3. Set up the database with Prisma:
```bash
# Generate the Prisma client
npx prisma generate

# Push the schema to your database
npx prisma db push

# Optional: Open Prisma Studio to view your data
npx prisma studio
```

### Running the Server

For development (with hot reload):
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

The server starts on port 5000 by default. You should see "Server running on port 5000" in the console.

## How It Works

### API Routes

I've organized the API into a few main sections:

**Auth Routes** (`/api/auth`)
- `POST /login` - Admin login (returns a JWT token)
- `GET /verify` - Check if a token is still valid

**Chat Routes** (`/api/chats`)
- `GET /` - Get all chat sessions (for the admin dashboard)
- `GET /:sessionId` - Get a specific conversation
- `POST /` - Create a new chat session

**Message Routes** (`/api/messages`)
- `GET /:sessionId` - Fetch all messages for a session
- `PATCH /:id` - Mark a message as read

**AI Routes** (`/api/ai`) - Bonus feature!
- `GET /config` - Get current AI settings
- `PUT /config` - Update AI configuration
- `POST /test` - Test the AI with a sample message

### Real-Time Events (Socket.IO)

The real magic happens with Socket.IO. Here's how the events flow:

**From Client:**
- `user-connected` - When someone opens the chat widget
- `user-message` - When a user sends a message
- `admin-reply` - When admin responds
- `user-typing` / `admin-typing` - Typing indicators

**To Client:**
- `admin-reply` - Send admin's message to the user
- `ai-reply` - Send AI-generated response (bonus feature)
- `user-message` - Broadcast user message to all admins
- `chat-list-update` - Tell admins to refresh their chat list
- `ai-thinking` - Show "AI is thinking..." indicator

### Project Structure

I tried to keep things organized and modular:

```
src/
├── config/
│   └── database.ts          # Prisma client setup
├── controllers/
│   ├── authController.ts    # Login logic
│   ├── chatController.ts    # Chat session management
│   ├── messageController.ts # Message operations
│   └── aiController.ts      # AI configuration
├── middleware/
│   ├── authMiddleware.ts    # JWT verification
│   └── errorHandler.ts      # Global error handling
├── routes/
│   └── ...                  # Route definitions
├── services/
│   ├── socketService.ts     # Socket.IO event handlers
│   ├── sessionService.ts    # Session management
│   └── aiService.ts         # AI integration
├── app.ts                   # Express app configuration
└── server.ts                # Server entry point
```

### Database Schema

Using Prisma made this really straightforward. Here's what the schema looks like:

**Session** - Tracks each user's chat session
- Stores session ID, IP address, user agent
- Tracks when they were last active
- Has a flag for whether they've been handed off to an admin

**Message** - All the chat messages
- Links to a session
- Stores the message content
- Tracks who sent it (user, admin, or AI)
- Includes timestamp and read status

**AIConfig** - Settings for the AI integration
- Toggle AI on/off
- Choose provider (OpenAI or OpenRouter)
- Configure model, temperature, max tokens, etc.

## A Few Notes

**Authentication:** I kept it simple with hardcoded admin credentials (configurable via .env). For a production app, you'd want proper user management with hashed passwords.

**AI Integration:** This was a bonus feature I added. The system can auto-respond to users with AI, but smartly hands off to a human when the user asks for one. Check out `aiService.ts` to see how it works.

**Socket.IO Rooms:** I'm using rooms to ensure messages go to the right people. When a user connects, they join a room with their session ID, so admin replies only go to them.

**Error Handling:** There's a global error handler middleware that catches any issues and returns proper error responses.

## Development Tips

- Use `npx prisma studio` to view and edit database records visually
- Check the console logs - I've added helpful messages for debugging
- If Socket.IO isn't connecting, make sure CORS is configured correctly
- The typing indicators have a small delay to avoid spamming events

## What's Next?

Some things I'd add if I had more time:
- File upload support for images/documents
- Better admin user management
- Rate limiting to prevent spam
- Message search functionality
- Analytics dashboard

---

Built with ☕ and TypeScript
