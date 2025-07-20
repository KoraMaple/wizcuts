import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BarberController } from './controllers/barber.controller';
import { BarberService } from './services/barber-drizzle.service';
import { BookingService } from './services/booking.service';
import {
  StorageService,
  SupabaseStorageService,
  LocalStorageService,
} from './services/storage.service';
import { RealtimeService } from './services/realtime.service';
import { SupabaseConfigService } from './config/supabase.config';
import { env } from './config/environment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
  ],
  controllers: [AppController, BarberController],
  providers: [
    AppService,
    BarberService,
    BookingService,
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
})
export class AppModule {}
