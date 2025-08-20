import type { Service as ServiceRow } from '../../../../schema';
import type { ServiceEntity } from '../../domain/service.entity';

export const toDomain = (row: ServiceRow): ServiceEntity => {
  const priceCents = Math.round(
    parseFloat(row.basePrice as unknown as string) * 100
  );
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceCents,
    durationMinutes: row.durationMinutes,
    category: row.category,
    isActive: row.isActive,
    image: row.image ?? null,
    createdAt: new Date(row.createdAt as unknown as string),
    updatedAt: new Date(row.updatedAt as unknown as string),
  };
};
