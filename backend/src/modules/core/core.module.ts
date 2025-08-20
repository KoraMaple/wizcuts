import { Module } from '@nestjs/common';
import { env } from '../../config/environment';
import { RealtimeService } from '../../services/realtime.service';
import { SupabaseConfigService } from '../../config/supabase.config';
import {
  StorageService,
  SupabaseStorageService,
  LocalStorageService,
} from '../../services/storage.service';

@Module({
  providers: [
    RealtimeService,
    SupabaseConfigService,
    {
      provide: StorageService,
      useClass:
        env.storageProvider === 'supabase'
          ? SupabaseStorageService
          : LocalStorageService,
    },
  ],
  exports: [RealtimeService, SupabaseConfigService, StorageService],
})
export class CoreModule {}
