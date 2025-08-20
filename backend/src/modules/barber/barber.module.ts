import { Module } from '@nestjs/common';
import { BarberController } from '../../controllers/barber.controller';
import { BarberService } from '../../services/barber-drizzle.service';
import { CoreModule } from '../core/core.module';
import { BARBERS_REPOSITORY } from './domain/barber.repository';
import { BarbersRepository } from './infrastructure/barbers.repository';
import { ListActiveBarbersUseCase } from './application/list-active-barbers.usecase';
import { FindBarberByIdUseCase } from './application/find-barber-by-id.usecase';
import { FindBarbersByAvailabilityUseCase } from './application/find-barbers-by-availability.usecase';

/**
 * Transitional module for the Barber domain.
 * It wires existing controller/service without moving files yet.
 */
@Module({
  imports: [CoreModule],
  controllers: [BarberController],
  providers: [
    BarberService,
    { provide: BARBERS_REPOSITORY, useClass: BarbersRepository },
    ListActiveBarbersUseCase,
    FindBarberByIdUseCase,
    FindBarbersByAvailabilityUseCase,
  ],
  exports: [BarberService],
})
export class BarberModule {}
