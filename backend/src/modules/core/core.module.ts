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
      useFactory: (supabaseConfig: SupabaseConfigService) => {
        if (env.storageProvider === 'supabase') {
          return new SupabaseStorageService(supabaseConfig);
        } else {
          return new LocalStorageService();
        }
      },
      inject: [SupabaseConfigService],
    },
  ],
  exports: [RealtimeService, SupabaseConfigService, StorageService],
})
export class CoreModule {}
