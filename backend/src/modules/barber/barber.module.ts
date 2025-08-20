import { Module } from '@nestjs/common';
import { BarberController } from '../../controllers/barber.controller';
import { BarberService } from '../../services/barber-drizzle.service';
import { CoreModule } from '../core/core.module';

/**
 * Transitional module for the Barber domain.
 * It wires existing controller/service without moving files yet.
 */
@Module({
  imports: [CoreModule],
  controllers: [BarberController],
  providers: [BarberService],
  exports: [BarberService],
})
export class BarberModule {}
