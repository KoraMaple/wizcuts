import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from root directory
config({ path: join(__dirname, '../../../../.env') });

export interface EnvironmentConfig {
  // Database
  databaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  supabaseDbUrl?: string;

  // Authentication
  clerkPublishableKey: string;
  clerkSecretKey: string;

  // Application
  port: number;
  nodeEnv: string;
  environmentMode: string;

  // CORS & Frontend
  frontendUrl: string;

  // Storage
  storageProvider: 'local' | 'supabase';
  uploadMaxSize: number;

  // Real-time
  realtimeEnabled: boolean;
}

function validateEnvironment(): EnvironmentConfig {
  const requiredVars = [
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'CLERK_SECRET_KEY',
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.',
    );
  }

  return {
    // Database
    databaseUrl: process.env.DATABASE_URL!,
    supabaseUrl: process.env.SUPABASE_URL!,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    supabaseDbUrl: process.env.SUPABASE_DB_URL,

    // Authentication
    clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
    clerkSecretKey: process.env.CLERK_SECRET_KEY!,

    // Application
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    environmentMode: process.env.ENVIRONMENT_MODE || 'local',

    // CORS & Frontend
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

    // Storage
    storageProvider:
      (process.env.STORAGE_PROVIDER as 'local' | 'supabase') || 'supabase',
    uploadMaxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10),

    // Real-time
    realtimeEnabled: process.env.REALTIME_ENABLED === 'true',
  };
}

export const env = validateEnvironment();

// Debug logging for development
if (env.nodeEnv === 'development') {
  console.log('🔧 WizCuts Environment Configuration:');
  console.log(
    `   Database: ${env.databaseUrl ? '✅ Connected' : '❌ Missing'}`,
  );
  console.log(
    `   Supabase: ${env.supabaseUrl ? '✅ Connected' : '❌ Missing'}`,
  );
  console.log(
    `   Clerk Auth: ${env.clerkSecretKey ? '✅ Connected' : '❌ Missing'}`,
  );
  console.log(`   Mode: ${env.environmentMode}`);
  console.log(`   Port: ${env.port}`);
  console.log(`   Storage: ${env.storageProvider}`);
  console.log(`   Real-time: ${env.realtimeEnabled ? 'Enabled' : 'Disabled'}`);
}
