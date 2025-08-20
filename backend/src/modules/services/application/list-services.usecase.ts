import { Inject, Injectable } from '@nestjs/common';
import type { ServiceEntity } from '../domain/service.entity';
import {
  SERVICES_REPOSITORY,
  type ServicesRepositoryPort,
} from '../domain/service.repository';
import type { ServicesQueryDto } from '../interface/dto/services-query.dto';

@Injectable()
export class ListServicesUseCase {
  constructor(
    @Inject(SERVICES_REPOSITORY)
    private readonly repo: ServicesRepositoryPort
  ) {}

  async execute(query?: Partial<ServicesQueryDto>): Promise<ServiceEntity[]> {
    const { category, search, active, limit = 20, offset = 0 } = query || {};
    // Default to active services when not explicitly specified
    const effectiveActive = active === undefined ? true : active;
    return this.repo.list({
      category,
      search,
      active: effectiveActive,
      limit,
      offset,
    });
  }
}
