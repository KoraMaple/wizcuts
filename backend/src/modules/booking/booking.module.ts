import { Module } from '@nestjs/common';
import { BookingController } from '../../controllers/booking.controller';
import { BookingService } from '../../services/booking.service';
import { CoreModule } from '../core/core.module';

/**
 * Transitional Booking module that wires existing controller/service
 * without moving files. Safe to import into AppModule.
 */
@Module({
  imports: [CoreModule],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
