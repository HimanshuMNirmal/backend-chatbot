-- PostgreSQL Database Setup Script
-- Run this script as the postgres superuser

-- Create the database user if it doesn't exist
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'user') THEN
      CREATE USER "user" WITH PASSWORD 'password';
   END IF;
END
$$;

-- Create the database
DROP DATABASE IF EXISTS chatbot_db;
CREATE DATABASE chatbot_db;

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE chatbot_db TO "user";

-- Connect to the chatbot_db database
\c chatbot_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO "user";

-- Grant default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO "user";

-- Make the user the owner of the public schema
ALTER SCHEMA public OWNER TO "user";

-- Create tables based on Prisma schema

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" TIMESTAMP(3) NOT NULL,
    "handedOffToAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConfig" (
    "id" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT NOT NULL DEFAULT 'openrouter',
    "model" TEXT NOT NULL DEFAULT 'z-ai/glm-4.5-air:free',
    "systemPrompt" TEXT NOT NULL DEFAULT 'You are a helpful customer support assistant.',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "maxTokens" INTEGER NOT NULL DEFAULT 500,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionId_key" ON "Session"("sessionId");

-- CreateIndex
CREATE INDEX "Message_sessionId_idx" ON "Message"("sessionId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- Grant privileges on new tables (redundant with default privileges but good for safety)
GRANT ALL ON ALL TABLES IN SCHEMA public TO "user";
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO "user";

-- Display success message
\echo 'Database setup completed successfully!'
\echo 'Database: chatbot_db'
\echo 'User: user'
\echo 'Connection string: postgresql://user:password@localhost:5432/chatbot_db'
