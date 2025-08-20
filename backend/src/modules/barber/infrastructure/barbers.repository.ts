import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { getDatabase } from '../../../database/database';
import { availabilities, barbers } from '../../../schema';
import type { BarberEntity } from '../domain/barber.entity';
import type { BarbersRepositoryPort } from '../domain/barber.repository';
import { toDomain } from './mappers/barber.mapper';

@Injectable()
export class BarbersRepository implements BarbersRepositoryPort {
  private db = getDatabase();

  async listActive(): Promise<BarberEntity[]> {
    const rows = await this.db
      .select()
      .from(barbers)
      .where(eq(barbers.isActive, true))
      .orderBy(barbers.name);
    return rows.map(toDomain);
  }

  async findOne(id: number): Promise<BarberEntity | null> {
    const rows = await this.db.select().from(barbers).where(eq(barbers.id, id));
    if (!rows[0]) return null;
    return toDomain(rows[0]);
  }

  async findByAvailability(date: Date): Promise<BarberEntity[]> {
    const dayOfWeek = date.getDay();
    const rows = await this.db
      .select({
        id: barbers.id,
        name: barbers.name,
        title: barbers.title,
        bio: barbers.bio,
        image: barbers.image,
        experienceYears: barbers.experienceYears,
        specialties: barbers.specialties,
        rating: barbers.rating,
        reviewCount: barbers.reviewCount,
        isActive: barbers.isActive,
        phone: barbers.phone,
        email: barbers.email,
        createdAt: barbers.createdAt,
        updatedAt: barbers.updatedAt,
      })
      .from(barbers)
      .innerJoin(availabilities, eq(barbers.id, availabilities.barberId))
      .where(
        and(
          eq(barbers.isActive, true),
          eq(availabilities.dayOfWeek, dayOfWeek),
          eq(availabilities.isActive, true)
        )
      );

    // rows is a projection; cast to BarberEntity parts
    return rows.map(r =>
      toDomain({
        id: r.id,
        name: r.name,
        title: r.title,
        bio: r.bio,
        image: r.image,
        experienceYears: r.experienceYears,
        specialties: r.specialties,
        rating: r.rating,
        reviewCount: r.reviewCount,
        isActive: r.isActive,
        phone: r.phone,
        email: r.email,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      } as any)
    );
  }
}
