import { Inject, Injectable } from '@nestjs/common';
import {
  BOOKINGS_REPOSITORY,
  BookingsRepositoryPort,
} from '../domain/booking.repository';

@Injectable()
export class DeleteBookingUseCase {
  constructor(
    @Inject(BOOKINGS_REPOSITORY)
    private readonly repo: BookingsRepositoryPort
  ) {}

  async execute(id: number): Promise<void> {
    return this.repo.delete(id);
  }
}
