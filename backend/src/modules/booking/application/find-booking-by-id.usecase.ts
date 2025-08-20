import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  BOOKINGS_REPOSITORY,
  BookingsRepositoryPort,
} from '../domain/booking.repository';
import { Booking } from '../domain/booking.entity';

@Injectable()
export class FindBookingByIdUseCase {
  constructor(
    @Inject(BOOKINGS_REPOSITORY)
    private readonly repo: BookingsRepositoryPort
  ) {}

  async execute(id: number): Promise<Booking> {
    const booking = await this.repo.findById(id);
    if (!booking)
      throw new NotFoundException(`Booking with ID ${id} not found`);
    return booking;
  }
}
