import {
  IBookingRepository,
  CreateBookingInput,
} from '../../domain/booking.repository';
import { Booking } from '../../domain/booking.entity';

// Placeholder Drizzle implementation. Not wired yet.
export class DrizzleBookingRepository implements IBookingRepository {
  async create(_input: CreateBookingInput): Promise<Booking> {
    throw new Error('Not implemented');
  }

  async findById(_id: number): Promise<Booking | null> {
    throw new Error('Not implemented');
  }

  async listByBarberAndDate(
    _barberId: number,
    _date: Date
  ): Promise<Booking[]> {
    throw new Error('Not implemented');
  }

  async delete(_id: number): Promise<void> {
    throw new Error('Not implemented');
  }
}
