import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  BARBERS_REPOSITORY,
  type BarbersRepositoryPort,
} from '../domain/barber.repository';
import type { BarberEntity } from '../domain/barber.entity';

@Injectable()
export class ListActiveBarbersUseCase {
  constructor(
    @Inject(BARBERS_REPOSITORY)
    private readonly repo: BarbersRepositoryPort
  ) {}

  async execute(): Promise<BarberEntity[]> {
    return this.repo.listActive();
  }
}
