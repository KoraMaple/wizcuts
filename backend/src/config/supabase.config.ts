import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SupabaseConfigService {
  private readonly supabaseClient: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    if (process.env.SKIP_EXTERNAL_CLIENTS === 'true') {
      // Bypass real client initialization during tooling (e.g., OpenAPI export)
      // Methods that use the client won't be called in this context.
      // @ts-expect-error - intentionally assigning a dummy object
      this.supabaseClient = {};
      return;
    }

    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  // Service role client for admin operations
  getServiceRoleClient(): SupabaseClient {
    if (process.env.SKIP_EXTERNAL_CLIENTS === 'true') {
      throw new Error('Service role client is disabled in tooling mode');
    }
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY'
    );

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase service role configuration is missing');
    }

    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // Database URL for Drizzle
  getDatabaseUrl(): string {
    const environmentMode = this.configService.get<string>(
      'ENVIRONMENT_MODE',
      'local'
    );

    if (environmentMode === 'local') {
      return (
        this.configService.get<string>('SUPABASE_DB_URL') ||
        'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
      );
    }

    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required for production environment');
    }

    return databaseUrl;
  }

  // Storage configuration
  getStorageConfig() {
    return {
      provider: this.configService.get<string>('STORAGE_PROVIDER', 'supabase'),
      maxSize: this.configService.get<number>('UPLOAD_MAX_SIZE', 5242880), // 5MB
      buckets: {
        barberImages: 'barber-images',
        galleryImages: 'gallery-images',
        userUploads: 'user-uploads',
      },
    };
  }
}
