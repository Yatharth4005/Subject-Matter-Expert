import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const databaseUrl = process.env.DATABASE_URL || 'postgres://localhost:5432/dummy';
const sql = neon(databaseUrl);
export const db = drizzle(sql);
