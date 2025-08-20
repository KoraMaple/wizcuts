import { Module } from '@nestjs/common';
import { BookingController } from '../../controllers/booking.controller';
import { BookingService } from '../../services/booking.service';
import { CoreModule } from '../core/core.module';
import { BOOKINGS_REPOSITORY } from './domain/booking.repository';
import { BookingServiceAdapter } from './infra/repositories/booking.service.adapter';
import { ListBookingsUseCase } from './application/list-bookings.usecase';
import { FindBookingByIdUseCase } from './application/find-booking-by-id.usecase';
import { ListUserBookingsUseCase } from './application/list-user-bookings.usecase';
import { CreateBookingUseCase } from './application/create-booking.usecase';
import { UpdateBookingUseCase } from './application/update-booking.usecase';
import { DeleteBookingUseCase } from './application/delete-booking.usecase';
import { ConfirmBookingUseCase } from './application/confirm-booking.usecase';
import { CancelBookingUseCase } from './application/cancel-booking.usecase';

/**
 * Transitional Booking module that wires existing controller/service
 * without moving files. Safe to import into AppModule.
 */
@Module({
  imports: [CoreModule],
  controllers: [BookingController],
  providers: [
    BookingService,
    { provide: BOOKINGS_REPOSITORY, useClass: BookingServiceAdapter },
    ListBookingsUseCase,
    FindBookingByIdUseCase,
    ListUserBookingsUseCase,
    CreateBookingUseCase,
    UpdateBookingUseCase,
    DeleteBookingUseCase,
    ConfirmBookingUseCase,
    CancelBookingUseCase,
  ],
  exports: [BookingService],
})
export class BookingModule {}
