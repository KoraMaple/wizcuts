import { BarberEntity } from './barber.entity';

export const BARBERS_REPOSITORY = Symbol('BARBERS_REPOSITORY');

export interface BarbersRepositoryPort {
  listActive(): Promise<BarberEntity[]>;
  findOne(id: number): Promise<BarberEntity | null>;
  findByAvailability(date: Date): Promise<BarberEntity[]>;
}
