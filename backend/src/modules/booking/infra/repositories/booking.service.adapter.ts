import { Injectable } from '@nestjs/common';
import {
  BookingsRepositoryPort,
  BookingsListQuery,
  CreateBookingInput,
  UpdateBookingInput,
} from '../../domain/booking.repository';
import { Booking } from '../../domain/booking.entity';
import { BookingService } from '../../../../services/booking.service';

@Injectable()
export class BookingServiceAdapter implements BookingsRepositoryPort {
  constructor(private readonly bookingService: BookingService) {}

  async create(input: CreateBookingInput): Promise<Booking> {
    // Not used by current use cases; pass-through best effort mapping
    const dto: any = {
      barberId: input.barberId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: (input as any).customerPhone,
      serviceName: (input as any).serviceName,
      totalPrice: (input as any).totalPrice,
      durationMinutes: (input as any).durationMinutes,
      appointmentDateTime:
        (input as any).appointmentDateTime ?? (input.startTime as any),
      notes: input.notes,
    };
    const created = await this.bookingService.create(dto);
    return this.toDomain(created);
  }

  async update(id: number, input: UpdateBookingInput): Promise<Booking> {
    const dto: any = {
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: (input as any).customerPhone,
      serviceName: (input as any).serviceName,
      totalPrice: (input as any).totalPrice,
      durationMinutes: (input as any).durationMinutes,
      appointmentDateTime:
        (input as any).appointmentDateTime ?? input.startTime,
      notes: input.notes,
    };
    const updated = await this.bookingService.update(id, dto);
    return this.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.bookingService.remove(id);
  }

  async confirm(id: number): Promise<Booking> {
    const confirmed = await this.bookingService.confirm(id);
    return this.toDomain(confirmed);
  }

  async cancel(id: number, userId?: string): Promise<Booking> {
    const cancelled = await this.bookingService.cancel(id, userId || '');
    return this.toDomain(cancelled);
  }

  async findById(id: number): Promise<Booking | null> {
    try {
      const b = await this.bookingService.findOne(id);
      return this.toDomain(b);
    } catch {
      return null;
    }
  }

  async list(query: BookingsListQuery = {}): Promise<Booking[]> {
    const list = await this.bookingService.findAll(query as any);
    return list.map((b: any) => this.toDomain(b));
  }

  async listByUser(userId: string): Promise<Booking[]> {
    const list = await this.bookingService.findUserBookings(userId);
    return list.map((b: any) => this.toDomain(b));
  }

  private toDomain(b: any): Booking {
    const start = b.startTime
      ? new Date(b.startTime)
      : new Date(b.appointmentDateTime);
    const end = b.endTime
      ? new Date(b.endTime)
      : new Date(start.getTime() + (b.durationMinutes ?? 0) * 60000);
    return {
      id: b.id,
      customerName: b.customerName,
      customerEmail: b.customerEmail ?? undefined,
      serviceId: b.serviceId ?? 0,
      barberId: b.barberId,
      barberName: b.barberName || b.barber?.name || undefined,
      serviceName: b.serviceName || b.service?.name || undefined,
      startTime: start,
      endTime: end,
      notes: b.notes ?? undefined,
      createdAt: new Date(b.createdAt),
      updatedAt: new Date(b.updatedAt),
    };
  }
}
