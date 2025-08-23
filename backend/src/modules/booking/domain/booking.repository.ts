import { Booking } from './booking.entity';

export interface CreateBookingInput {
  customerName: string;
  customerEmail?: string;
  serviceId: number;
  barberId: number;
  startTime: Date;
  endTime: Date;
  notes?: string;
}

export const BOOKINGS_REPOSITORY = 'BOOKINGS_REPOSITORY';

export interface BookingsListQuery {
  barberId?: number;
  status?: string;
  startDate?: string; // ISO date (yyyy-mm-dd)
  endDate?: string; // ISO date (yyyy-mm-dd)
}

export interface UpdateBookingInput {
  customerName?: string;
  customerEmail?: string;
  serviceId?: number;
  barberId?: number;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface BookingsRepositoryPort {
  // Writes
  create(input: CreateBookingInput): Promise<Booking>;
  update(id: number, input: UpdateBookingInput): Promise<Booking>;
  delete(id: number): Promise<void>;
  confirm(id: number): Promise<Booking>;
  cancel(id: number, userId?: string): Promise<Booking>;

  // Reads
  findById(id: number): Promise<Booking | null>;
  list(query?: BookingsListQuery): Promise<Booking[]>;
  listByUser(userId: string): Promise<Booking[]>;
}
