import { Injectable } from '@nestjs/common';

/**
 * Application service for Booking domain.
 * Currently a placeholder; real use-cases will be added in Phase 1.
 */
@Injectable()
export class BookingService {
  health() {
    return { status: 'ok' };
  }
}
