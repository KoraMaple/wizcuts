import { Module } from '@nestjs/common';
import { ServicesController } from './interface/services.controller';
import { ListServicesUseCase } from './application/list-services.usecase';
import { ServicesRepository } from './infrastructure/services.repository';
import { SERVICES_REPOSITORY } from './domain/service.repository';

/**
 * Placeholder Services feature module. Not yet wired into AppModule.
 */
@Module({
  controllers: [ServicesController],
  providers: [
    ListServicesUseCase,
    { provide: SERVICES_REPOSITORY, useClass: ServicesRepository },
  ],
})
export class ServicesModule {}
