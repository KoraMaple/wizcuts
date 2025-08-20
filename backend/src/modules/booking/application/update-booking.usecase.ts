import { Inject, Injectable } from '@nestjs/common';
import {
  BOOKINGS_REPOSITORY,
  BookingsRepositoryPort,
  UpdateBookingInput,
} from '../domain/booking.repository';
import { Booking } from '../domain/booking.entity';

@Injectable()
export class UpdateBookingUseCase {
  constructor(
    @Inject(BOOKINGS_REPOSITORY)
    private readonly repo: BookingsRepositoryPort
  ) {}

  async execute(id: number, input: UpdateBookingInput): Promise<Booking> {
    return this.repo.update(id, input);
  }
}
