import { Controller, Get } from '@nestjs/common';

/**
 * Placeholder controller for Booking domain.
 * Not registered in AppModule yet, so it does not affect routing.
 */
@Controller('booking')
export class BookingController {
  @Get('ping')
  ping() {
    return { ok: true };
  }
}
