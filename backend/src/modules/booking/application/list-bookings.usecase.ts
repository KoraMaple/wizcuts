import { Inject, Injectable } from '@nestjs/common';
import {
  BOOKINGS_REPOSITORY,
  BookingsListQuery,
  BookingsRepositoryPort,
} from '../domain/booking.repository';
import { Booking } from '../domain/booking.entity';

@Injectable()
export class ListBookingsUseCase {
  constructor(
    @Inject(BOOKINGS_REPOSITORY)
    private readonly repo: BookingsRepositoryPort
  ) {}

  async execute(query: BookingsListQuery = {}): Promise<Booking[]> {
    return this.repo.list(query);
  }
}
