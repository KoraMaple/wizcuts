import type {
  Barber as BarberRow,
  availabilities as AvailabilitiesTable,
  barbers as BarbersTable,
} from '../../../../schema';
import type { BarberEntity } from '../../domain/barber.entity';

export const toDomain = (row: BarberRow): BarberEntity => ({
  id: row.id,
  name: row.name,
  title: row.title ?? null,
  bio: row.bio ?? null,
  image: row.image ?? null,
  experienceYears: row.experienceYears ?? null,
  specialties: row.specialties ?? null,
  rating: row.rating,
  reviewCount: row.reviewCount,
  isActive: row.isActive,
  phone: row.phone ?? null,
  email: row.email ?? null,
  createdAt: new Date(row.createdAt as unknown as string),
  updatedAt: new Date(row.updatedAt as unknown as string),
});
