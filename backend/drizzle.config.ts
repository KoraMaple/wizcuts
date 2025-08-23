import { config } from 'dotenv';
import { resolve } from 'path';
import type { Config } from 'drizzle-kit';
import { defineConfig } from 'drizzle-kit';

// Load .env from project root (../.env relative to backend/)
config({ path: resolve(__dirname, '../.env') });

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
}) satisfies Config;
