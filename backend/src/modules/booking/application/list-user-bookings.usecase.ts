import { Inject, Injectable } from '@nestjs/common';
import {
  BOOKINGS_REPOSITORY,
  BookingsRepositoryPort,
} from '../domain/booking.repository';
import { Booking } from '../domain/booking.entity';

@Injectable()
export class ListUserBookingsUseCase {
  constructor(
    @Inject(BOOKINGS_REPOSITORY)
    private readonly repo: BookingsRepositoryPort
  ) {}

  async execute(userId: string): Promise<Booking[]> {
    return this.repo.listByUser(userId);
  }
}
