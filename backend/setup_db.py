import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL")

def setup_db():
    print(f"Connecting to {NEON_DATABASE_URL[:50]}...")
    try:
        conn = psycopg2.connect(NEON_DATABASE_URL)
        cur = conn.cursor()
        
        # Create users table (compatible with NextAuth)
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            "emailVerified" TIMESTAMP,
            image VARCHAR(500),
            created_at TIMESTAMP DEFAULT NOW()
        );
        """)
        
        # Create conversations table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id),
            agent_slug VARCHAR(50) NOT NULL,
            title VARCHAR(255),
            started_at TIMESTAMP DEFAULT NOW(),
            ended_at TIMESTAMP,
            metadata JSONB DEFAULT '{}'
        );
        """)
        
        # Create messages table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
            role VARCHAR(20) NOT NULL,
            content_type VARCHAR(20) NOT NULL,
            content TEXT,
            audio_url VARCHAR(500),
            media_url VARCHAR(500),
            created_at TIMESTAMP DEFAULT NOW()
        );
        """)
        
        conn.commit()
        print("Tables created successfully!")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    setup_db()
