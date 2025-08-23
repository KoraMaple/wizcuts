import { Inject, Injectable } from '@nestjs/common';
import {
  BARBERS_REPOSITORY,
  type BarbersRepositoryPort,
} from '../domain/barber.repository';
import type { BarberEntity } from '../domain/barber.entity';

@Injectable()
export class FindBarbersByAvailabilityUseCase {
  constructor(
    @Inject(BARBERS_REPOSITORY)
    private readonly repo: BarbersRepositoryPort
  ) {}

  async execute(date: Date): Promise<BarberEntity[]> {
    return this.repo.findByAvailability(date);
  }
}
