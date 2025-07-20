import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db } from '../database/database';
import {
  barbers,
  bookings,
  availabilities,
  type Barber,
  type NewBarber,
} from '../schema';
import { CreateBarberDto, UpdateBarberDto } from '../dto/barber.dto';
import { RealtimeService } from './realtime.service';
import { StorageService } from './storage.service';

interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class BarberService {
  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly storageService: StorageService,
  ) {}

  async create(createBarberDto: CreateBarberDto): Promise<Barber> {
    const barberData: NewBarber = {
      ...createBarberDto,
      rating: '0.00', // Set default rating as string for decimal type
    };

    const [barber] = await db.insert(barbers).values(barberData).returning();

    // Broadcast barber created event
    await this.realtimeService.broadcastEvent('barbers', {
      type: 'barber_updated',
      payload: {
        barber,
        action: 'created',
      },
      timestamp: new Date(),
    });

    return barber;
  }

  async findAll(): Promise<Barber[]> {
    return await db
      .select()
      .from(barbers)
      .where(eq(barbers.isActive, true))
      .orderBy(barbers.name);
  }

  async findOne(id: number): Promise<Barber> {
    const [barber] = await db.select().from(barbers).where(eq(barbers.id, id));

    if (!barber) {
      throw new NotFoundException(`Barber with ID ${id} not found`);
    }

    return barber;
  }

  async findWithRelations(id: number) {
    const barber = await this.findOne(id);

    // Get barber's availabilities
    const barberAvailabilities = await db
      .select()
      .from(availabilities)
      .where(eq(availabilities.barberId, id));

    // Get barber's bookings
    const barberBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.barberId, id));

    return {
      ...barber,
      availabilities: barberAvailabilities,
      bookings: barberBookings,
    };
  }

  async update(id: number, updateBarberDto: UpdateBarberDto): Promise<Barber> {
    // Convert rating to string if provided, exclude it from spread to avoid type conflicts
    const { rating, ...restData } = updateBarberDto;
    const updateData = {
      ...restData,
      ...(rating !== undefined && { rating: rating.toString() }),
      updatedAt: new Date(),
    };

    const [barber] = await db
      .update(barbers)
      .set(updateData)
      .where(eq(barbers.id, id))
      .returning();

    if (!barber) {
      throw new NotFoundException(`Barber with ID ${id} not found`);
    }

    // Broadcast barber updated event
    await this.realtimeService.broadcastEvent('barbers', {
      type: 'barber_updated',
      payload: {
        barber,
        action: 'updated',
      },
      timestamp: new Date(),
    });

    return barber;
  }

  async remove(id: number): Promise<void> {
    const barber = await this.findOne(id); // Check if exists

    // Delete profile image if exists
    if (barber.image) {
      try {
        // Extract path from URL for deletion
        const imagePath = barber.image.split('/').pop() || '';
        await this.storageService.deleteFile('profiles', imagePath);
      } catch (error: unknown) {
        // Log error but continue with deletion
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.warn(`Failed to delete barber image: ${errorMessage}`);
      }
    }

    await db.delete(barbers).where(eq(barbers.id, id));

    // Broadcast barber deleted event
    await this.realtimeService.broadcastEvent('barbers', {
      type: 'barber_updated',
      payload: {
        barber,
        action: 'deleted',
      },
      timestamp: new Date(),
    });
  }

  async uploadProfileImage(id: number, file: MulterFile): Promise<string> {
    const barber = await this.findOne(id); // Check if exists

    // Delete old image if exists
    if (barber.image) {
      try {
        const imagePath = barber.image.split('/').pop() || '';
        await this.storageService.deleteFile('profiles', imagePath);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.warn(`Failed to delete old barber image: ${errorMessage}`);
      }
    }

    // Convert MulterFile to StorageFile
    const storageFile = {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };

    // Upload new image
    const fileName = `barber_${id}_${Date.now()}_${file.originalname}`;
    const uploadResult = await this.storageService.uploadFile(
      'profiles',
      storageFile,
      fileName,
    );

    // Update barber with new image URL
    const [updatedBarber] = await db
      .update(barbers)
      .set({
        image: uploadResult.url,
        updatedAt: new Date(),
      })
      .where(eq(barbers.id, id))
      .returning();

    // Broadcast barber updated event
    await this.realtimeService.broadcastEvent('barbers', {
      type: 'barber_updated',
      payload: {
        barber: updatedBarber,
        action: 'image_updated',
      },
      timestamp: new Date(),
    });

    return uploadResult.url;
  }

  async findByAvailability(date: Date): Promise<Barber[]> {
    const dayOfWeek = date.getDay();

    // Get barbers with availability for this day
    const availableBarbers = await db
      .selectDistinct({
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
          eq(availabilities.isActive, true),
        ),
      );

    return availableBarbers;
  }

  async findBusyBarbers(date: Date, startTime: string): Promise<number[]> {
    const dateStr = date.toISOString().split('T')[0]; // Get YYYY-MM-DD format

    const busyBookings = await db
      .selectDistinct({ barberId: bookings.barberId })
      .from(bookings)
      .where(
        and(
          eq(
            bookings.appointmentDateTime,
            new Date(`${dateStr}T${startTime}:00`),
          ),
          // Add logic for time overlap checking
        ),
      );

    return busyBookings.map((booking) => booking.barberId);
  }
}
