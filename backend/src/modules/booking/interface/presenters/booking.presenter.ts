import { Booking } from '../../domain/booking.entity';
import { BookingDto } from '../dto/booking.dto';

export function bookingToDto(b: Booking): BookingDto {
  return {
    id: b.id,
    barberId: b.barberId,
    barberName: (b as any).barberName,
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    customerPhone: (b as any).customerPhone,
    serviceName: (b as any).serviceName,
    totalPrice: (b as any).totalPrice,
    appointmentDateTime: new Date(
      (b as any).appointmentDateTime ?? (b as any).startTime ?? b.startTime
    ).toISOString(),
    durationMinutes:
      (b as any).durationMinutes ??
      Math.max(
        0,
        Math.round(
          ((b.endTime?.getTime?.() ??
            new Date((b as any).endTime ?? 0).getTime()) -
            b.startTime.getTime()) /
            60000
        )
      ),
    status: (b as any).status ?? 'pending',
    notes: (b as any).notes ?? b.notes ?? null,
    clerkUserId: (b as any).clerkUserId ?? null,
    createdAt: new Date((b as any).createdAt ?? b.createdAt).toISOString(),
    updatedAt: new Date((b as any).updatedAt ?? b.updatedAt).toISOString(),
  };
}
