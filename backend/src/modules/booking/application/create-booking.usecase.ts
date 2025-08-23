import { Inject, Injectable } from '@nestjs/common';
import {
  BOOKINGS_REPOSITORY,
  BookingsRepositoryPort,
  CreateBookingInput,
} from '../domain/booking.repository';
import { Booking } from '../domain/booking.entity';

@Injectable()
export class CreateBookingUseCase {
  constructor(
    @Inject(BOOKINGS_REPOSITORY)
    private readonly repo: BookingsRepositoryPort
  ) {}

  async execute(input: CreateBookingInput): Promise<Booking> {
    return this.repo.create(input);
  }
}
