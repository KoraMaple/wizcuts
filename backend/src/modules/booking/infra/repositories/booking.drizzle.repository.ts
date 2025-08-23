import {
  CreateBookingInput,
  UpdateBookingInput,
  BookingsListQuery,
  BookingsRepositoryPort,
} from '../../domain/booking.repository';
import { Booking } from '../../domain/booking.entity';

// Placeholder Drizzle implementation. Not wired yet.
export class DrizzleBookingRepository implements BookingsRepositoryPort {
  async create(_input: CreateBookingInput): Promise<Booking> {
    throw new Error('Not implemented');
  }

  async update(_id: number, _input: UpdateBookingInput): Promise<Booking> {
    throw new Error('Not implemented');
  }

  async findById(_id: number): Promise<Booking | null> {
    throw new Error('Not implemented');
  }

  async list(_query?: BookingsListQuery): Promise<Booking[]> {
    throw new Error('Not implemented');
  }

  async listByUser(_userId: string): Promise<Booking[]> {
    throw new Error('Not implemented');
  }

  async delete(_id: number): Promise<void> {
    throw new Error('Not implemented');
  }

  async confirm(_id: number): Promise<Booking> {
    throw new Error('Not implemented');
  }

  async cancel(_id: number, _userId?: string): Promise<Booking> {
    throw new Error('Not implemented');
  }

  // Legacy helper kept for potential future implementation
  async listByBarberAndDate(
    _barberId: number,
    _date: Date
  ): Promise<Booking[]> {
    throw new Error('Not implemented');
  }
}
