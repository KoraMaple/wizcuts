import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { db } from '../../../../database/database';
import {
  availabilities,
  bookings,
  services,
  type Availability,
  type Booking,
} from '../../../../schema';
import { and, eq, gte, lte } from 'drizzle-orm';

/**
 * Public availability endpoint. No auth required.
 * Computes available time slots for a given barber, service and date based on:
 *  - Per-day barber working window from `availabilities` (no buffers)
 *  - Service duration (slot granularity)
 *  - Excludes overlaps with existing bookings for the barber on the same date
 */
@ApiTags('availability')
@Controller({ path: 'availability', version: '1' })
export class AvailabilityController {
  @Get()
  @ApiOperation({
    summary:
      'Get available time slots for a barber and service on a given date',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    example: '2025-08-21',
  })
  @ApiQuery({ name: 'serviceId', required: true, type: Number, example: 1 })
  @ApiQuery({ name: 'barberId', required: true, type: Number, example: 1 })
  @ApiOkResponse({
    description: 'List of available slots',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          start: { type: 'string', example: '2025-08-21T15:00:00.000Z' },
          end: { type: 'string', example: '2025-08-21T15:30:00.000Z' },
          available: { type: 'boolean', example: true },
        },
      },
    },
  })
  async getAvailability(
    @Query('date') dateStr: string,
    @Query('serviceId') serviceIdStr: string,
    @Query('barberId') barberIdStr: string
  ) {
    const serviceId = Number(serviceIdStr);
    const barberId = Number(barberIdStr);

    if (!dateStr || isNaN(serviceId) || isNaN(barberId)) {
      throw new BadRequestException(
        'date, serviceId and barberId are required'
      );
    }

    // Validate date format minimally (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new BadRequestException('date must be in YYYY-MM-DD format');
    }

    // Fetch service to get duration
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId));
    if (!service) {
      throw new BadRequestException(`Service ${serviceId} not found`);
    }
    const duration = service.durationMinutes; // minutes

    // Determine dayOfWeek: schema uses 0 = Monday ... 6 = Sunday
    const jsDay = new Date(dateStr + 'T00:00:00.000Z').getUTCDay(); // 0 = Sunday ... 6 = Saturday
    const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

    // Get barber working window for that day
    const [dayAvailability] = await db
      .select()
      .from(availabilities)
      .where(
        and(
          eq(availabilities.barberId, barberId),
          eq(availabilities.dayOfWeek, dayOfWeek),
          eq(availabilities.isActive, true)
        )
      );

    if (!dayAvailability) {
      return [];
    }

    // Build start/end Date objects in UTC using HH:MM strings
    const [startH, startM] = (dayAvailability.startTime as string)
      .split(':')
      .map(Number);
    const [endH, endM] = (dayAvailability.endTime as string)
      .split(':')
      .map(Number);

    const windowStart = new Date(dateStr + 'T00:00:00.000Z');
    windowStart.setUTCHours(startH, startM, 0, 0);

    const windowEnd = new Date(dateStr + 'T00:00:00.000Z');
    windowEnd.setUTCHours(endH, endM, 0, 0);

    if (!(windowStart < windowEnd)) {
      return [];
    }

    // Fetch existing bookings for this barber on this date
    const bookingsForDay: Booking[] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.barberId, barberId),
          gte(bookings.appointmentDateTime, windowStart),
          lte(bookings.appointmentDateTime, windowEnd)
        )
      );

    // Generate candidate slots stepping by service duration
    const slots: { start: Date; end: Date }[] = [];
    for (
      let t = new Date(windowStart);
      t.getTime() + duration * 60000 <= windowEnd.getTime();
      t = new Date(t.getTime() + duration * 60000)
    ) {
      const start = new Date(t);
      const end = new Date(t.getTime() + duration * 60000);
      slots.push({ start, end });
    }

    // Filter out any slot that overlaps existing bookings (inclusive start, exclusive end)
    const isOverlap = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) =>
      aStart < bEnd && aEnd > bStart;

    const available = slots.filter(({ start, end }) => {
      return !bookingsForDay.some(b => {
        const bStart = new Date(b.appointmentDateTime);
        const bEnd = new Date(bStart.getTime() + b.durationMinutes * 60000);
        return isOverlap(start, end, bStart, bEnd);
      });
    });

    return available.map(s => ({
      start: s.start.toISOString(),
      end: s.end.toISOString(),
      available: true,
    }));
  }
}
