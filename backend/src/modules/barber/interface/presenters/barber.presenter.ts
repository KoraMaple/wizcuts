import type { BarberEntity } from '../../domain/barber.entity';
import { BarberDto } from '../dto/barber.dto';

// Accept either domain entity or schema row-like
// and normalize to BarberDto
export const toDto = (src: any): BarberDto => ({
  id: src.id,
  name: src.name,
  title: src.title ?? null,
  bio: src.bio ?? null,
  image: src.image ?? null,
  experienceYears: src.experienceYears ?? null,
  specialties: src.specialties ?? null,
  rating: String(src.rating),
  reviewCount: src.reviewCount,
  isActive: src.isActive,
  phone: src.phone ?? null,
  email: src.email ?? null,
  createdAt: (src.createdAt instanceof Date
    ? src.createdAt
    : new Date(src.createdAt)
  ).toISOString(),
  updatedAt: (src.updatedAt instanceof Date
    ? src.updatedAt
    : new Date(src.updatedAt)
  ).toISOString(),
});
