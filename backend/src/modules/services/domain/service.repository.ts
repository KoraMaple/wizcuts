import { ServiceEntity } from './service.entity';

export const SERVICES_REPOSITORY = Symbol('SERVICES_REPOSITORY');

export interface ServicesRepositoryPort {
  list(params: {
    category?: string;
    search?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ServiceEntity[]>;

  listActive(): Promise<ServiceEntity[]>;
}
