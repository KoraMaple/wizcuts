import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  BARBERS_REPOSITORY,
  type BarbersRepositoryPort,
} from '../domain/barber.repository';
import type { BarberEntity } from '../domain/barber.entity';

@Injectable()
export class FindBarberByIdUseCase {
  constructor(
    @Inject(BARBERS_REPOSITORY)
    private readonly repo: BarbersRepositoryPort
  ) {}

  async execute(id: number): Promise<BarberEntity> {
    const item = await this.repo.findOne(id);
    if (!item) throw new NotFoundException(`Barber with ID ${id} not found`);
    return item;
  }
}
