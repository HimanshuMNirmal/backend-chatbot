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

-- Display success message
\echo 'Database setup completed successfully!'
\echo 'Database: chatbot_db'
\echo 'User: user'
\echo 'Connection string: postgresql://user:password@localhost:5432/chatbot_db'
