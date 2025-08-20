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

export interface IBookingRepository {
  create(input: CreateBookingInput): Promise<Booking>;
  findById(id: number): Promise<Booking | null>;
  listByBarberAndDate(barberId: number, date: Date): Promise<Booking[]>;
  delete(id: number): Promise<void>;
}
