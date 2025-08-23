import { Injectable } from '@nestjs/common';
import { getDatabase } from '../../../database/database';
import { services as servicesTable } from '../../../schema';
import { and, asc, eq, ilike, or } from 'drizzle-orm';
import type { ServicesRepositoryPort } from '../domain/service.repository';
import { toDomain } from './mappers/service.mapper';

@Injectable()
export class ServicesRepository implements ServicesRepositoryPort {
  private db = getDatabase();

  async listActive() {
    const rows = await this.db
      .select()
      .from(servicesTable)
      .where(eq(servicesTable.isActive, true))
      .orderBy(asc(servicesTable.name));
    return rows.map(toDomain);
  }

  async list(params: {
    category?: string;
    search?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const { category, search, active, limit = 20, offset = 0 } = params;

    const whereClauses = [] as any[];
    if (active !== undefined)
      whereClauses.push(eq(servicesTable.isActive, active));
    if (category) whereClauses.push(eq(servicesTable.category, category));
    if (search) {
      const pattern = `%${search}%`;
      whereClauses.push(
        or(
          ilike(servicesTable.name, pattern),
          ilike(servicesTable.description, pattern)
        )
      );
    }

    const query = this.db
      .select()
      .from(servicesTable)
      .where(whereClauses.length ? and(...whereClauses) : undefined)
      .orderBy(asc(servicesTable.name))
      .limit(limit)
      .offset(offset);

    const rows = await query;
    return rows.map(toDomain);
  }
}
