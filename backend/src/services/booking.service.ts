import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and, gte, lte, or } from 'drizzle-orm';
import { db } from '../database/database';
import {
  bookings,
  barbers,
  type Booking,
  type NewBooking,
  BookingStatus,
} from '../schema';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingQueryDto,
} from '../dto/booking.dto';
import { RealtimeService } from './realtime.service';

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

@Injectable()
export class BookingService {
  constructor(private readonly realtimeService: RealtimeService) {}

  async create(
    createBookingDto: CreateBookingDto,
    user?: AuthUser
  ): Promise<Booking> {
    // Check if barber exists
    const [barber] = await db
      .select()
      .from(barbers)
      .where(eq(barbers.id, createBookingDto.barberId));
    if (!barber) {
      throw new NotFoundException(
        `Barber with ID ${createBookingDto.barberId} not found`
      );
    }

    // Convert string to Date for appointment
    const appointmentDate = new Date(createBookingDto.appointmentDateTime);

    // Check for conflicting bookings
    const conflictingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.barberId, createBookingDto.barberId),
          eq(bookings.appointmentDateTime, appointmentDate),
          or(
            eq(bookings.status, BookingStatus.CONFIRMED),
            eq(bookings.status, BookingStatus.PENDING)
          )
        )
      );

    if (conflictingBookings.length > 0) {
      throw new BadRequestException('Time slot is already booked');
    }

    const newBooking: NewBooking = {
      barberId: createBookingDto.barberId,
      customerName: createBookingDto.customerName,
      customerEmail: createBookingDto.customerEmail,
      customerPhone: createBookingDto.customerPhone,
      serviceName: createBookingDto.serviceName,
      totalPrice: createBookingDto.totalPrice.toString(),
      durationMinutes: createBookingDto.durationMinutes,
      appointmentDateTime: appointmentDate,
      status: BookingStatus.PENDING,
      notes: createBookingDto.notes || null,
      clerkUserId: user?.id || null,
    };

    const [booking] = await db.insert(bookings).values(newBooking).returning();

    // Broadcast booking created event
    await this.realtimeService.broadcastEvent('bookings', {
      type: 'booking_created',
      payload: {
        booking,
        action: 'created',
      },
      timestamp: new Date(),
    });

    return booking;
  }

  async findAll(queryDto: BookingQueryDto = {}): Promise<Booking[]> {
    const conditions: any[] = [];

    if (queryDto.barberId) {
      conditions.push(eq(bookings.barberId, queryDto.barberId));
    }

    if (queryDto.status) {
      conditions.push(eq(bookings.status, queryDto.status));
    }

    if (queryDto.startDate) {
      conditions.push(
        gte(bookings.appointmentDateTime, new Date(queryDto.startDate))
      );
    }

    if (queryDto.endDate) {
      conditions.push(
        lte(bookings.appointmentDateTime, new Date(queryDto.endDate))
      );
    }

    if (conditions.length === 0) {
      return await db
        .select()
        .from(bookings)
        .orderBy(bookings.appointmentDateTime);
    }

    if (conditions.length === 1) {
      return await db
        .select()
        .from(bookings)
        .where(conditions[0])
        .orderBy(bookings.appointmentDateTime);
    }

    return await db
      .select()
      .from(bookings)
      .where(and(conditions[0], ...conditions.slice(1)))
      .orderBy(bookings.appointmentDateTime);
  }

  async findOne(id: number): Promise<Booking> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async findUserBookings(clerkUserId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.clerkUserId, clerkUserId))
      .orderBy(bookings.appointmentDateTime);
  }

  async update(
    id: number,
    updateBookingDto: UpdateBookingDto
  ): Promise<Booking> {
    await this.findOne(id); // Check if exists

    const { appointmentDateTime, ...restData } = updateBookingDto;
    const updateData: Partial<NewBooking> = {
      ...restData,
      updatedAt: new Date(),
    };

    if (appointmentDateTime) {
      updateData.appointmentDateTime = new Date(appointmentDateTime);
    }

    const [updatedBooking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();

    if (!updatedBooking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Broadcast booking updated event
    await this.realtimeService.broadcastEvent('bookings', {
      type: 'booking_updated',
      payload: {
        booking: updatedBooking,
        action: 'updated',
      },
      timestamp: new Date(),
    });

    return updatedBooking;
  }

  async remove(id: number): Promise<void> {
    const booking = await this.findOne(id); // Check if exists
    await db.delete(bookings).where(eq(bookings.id, id));

    // Broadcast booking deleted event
    await this.realtimeService.broadcastEvent('bookings', {
      type: 'booking_cancelled',
      payload: {
        booking,
        action: 'deleted',
      },
      timestamp: new Date(),
    });
  }

  async cancel(id: number, clerkUserId: string): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.clerkUserId !== clerkUserId) {
      throw new BadRequestException('You can only cancel your own bookings');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    const cancelledBooking = await this.update(id, {
      status: BookingStatus.CANCELLED,
    });

    // Additional broadcast for cancellation
    await this.realtimeService.broadcastEvent('bookings', {
      type: 'booking_cancelled',
      payload: {
        booking: cancelledBooking,
        action: 'cancelled',
        userId: clerkUserId,
      },
      timestamp: new Date(),
    });

    return cancelledBooking;
  }

  async confirm(id: number): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }

    return await this.update(id, {
      status: BookingStatus.CONFIRMED,
    });
  }
}
