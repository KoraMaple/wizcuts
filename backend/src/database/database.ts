import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../schema';
import { env } from '../config/environment';

// Function to create database connection with dynamic URL
export function createDatabaseConnection(databaseUrl?: string) {
  // Try multiple environment variables in order of preference
  const connectionString = databaseUrl || env.databaseUrl || env.supabaseDbUrl;

  if (!connectionString) {
    console.error('Available environment variables:', {
      DATABASE_URL: env.databaseUrl ? '✓ Set' : '✗ Missing',
      SUPABASE_DB_URL: env.supabaseDbUrl ? '✓ Set' : '✗ Missing',
      NODE_ENV: env.nodeEnv,
      ENVIRONMENT_MODE: env.environmentMode,
    });
    throw new Error(
      'Database connection string is required. Please set DATABASE_URL or SUPABASE_DB_URL in your .env file'
    );
  }

  console.log(`🗄️  Connecting to ${env.environmentMode} database...`);

  const pool = new Pool({
    connectionString,
    ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    // Optimized connection pool settings for luxury performance
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Connection event handlers with elegant logging
  pool.on('connect', () => {
    console.log('✅ Database connected successfully');
  });

  pool.on('error', err => {
    console.error('❌ Database connection error:', err);
  });

  return drizzle(pool, { schema });
}

// Lazy initialization - create connection only when needed
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!dbInstance) {
    dbInstance = createDatabaseConnection();
  }
  return dbInstance;
}

// Default database instance (for backward compatibility)
// Allow tooling (e.g., OpenAPI export) to skip DB init
const SKIP_DB_INIT = process.env.SKIP_DB_INIT === 'true';
export const db = SKIP_DB_INIT
  ? (undefined as unknown as ReturnType<typeof drizzle>)
  : getDatabase();
