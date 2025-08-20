import type { ServiceEntity } from '../../domain/service.entity';
import type { ServiceDto } from '../dto/service.dto';

export const toDto = (entity: ServiceEntity): ServiceDto => ({
  id: entity.id,
  name: entity.name,
  description: entity.description,
  basePrice: (entity.priceCents / 100).toFixed(2),
  durationMinutes: entity.durationMinutes,
  category: entity.category,
  isActive: entity.isActive,
  image: entity.image ?? null,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
});
