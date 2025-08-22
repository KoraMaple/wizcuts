/*
  Seed database with services, barbers, per-day availabilities, and sample bookings.
  This script is idempotent and safe to re-run.
*/
import 'dotenv/config';
import { db } from '../database/database';
import {
  services as servicesTable,
  barbers as barbersTable,
  availabilities as availabilitiesTable,
  bookings as bookingsTable,
  DayOfWeek,
} from '../schema';
import { eq, and } from 'drizzle-orm';

async function seedServices() {
  const base = [
    {
      name: 'Classic Haircut',
      description: 'Timeless cut, tailored finish',
      basePrice: '35.00',
      durationMinutes: 30,
      category: 'Haircut',
      isActive: true,
      image: null as string | null,
    },
    {
      name: 'Beard Trim',
      description: 'Precision shape-up',
      basePrice: '20.00',
      durationMinutes: 15,
      category: 'Beard',
      isActive: true,
      image: null as string | null,
    },
    {
      name: 'Deluxe Cut',
      description: 'Cut, wash, and style',
      basePrice: '60.00',
      durationMinutes: 60,
      category: 'Package',
      isActive: true,
      image: null as string | null,
    },
  ];

  for (const s of base) {
    const existing = await db
      .select({ id: servicesTable.id })
      .from(servicesTable)
      .where(eq(servicesTable.name, s.name));
    if (existing.length === 0) {
      await db.insert(servicesTable).values(s as any);
    }
  }

  const rows = await db.select().from(servicesTable);
  return rows;
}

async function seedBarbers() {
  const base = [
    {
      name: 'Marcus Avery',
      title: 'Master Barber',
      bio: 'Specialist in classic styles and luxury finishes',
      image: '/images/barbers/marcus.jpg',
      experienceYears: 10,
      specialties: ['classic', 'fade', 'beard'],
      rating: '4.85',
      reviewCount: 120,
      isActive: true,
      phone: null as string | null,
      email: null as string | null,
    },
    {
      name: 'Lena Cruz',
      title: 'Stylist Barber',
      bio: 'Modern textures and precision detail',
      image: '/images/barbers/lena.jpg',
      experienceYears: 6,
      specialties: ['texture', 'scissor'],
      rating: '4.92',
      reviewCount: 98,
      isActive: true,
      phone: null as string | null,
      email: null as string | null,
    },
  ];

  for (const b of base) {
    const existing = await db
      .select({ id: barbersTable.id })
      .from(barbersTable)
      .where(eq(barbersTable.name, b.name));
    if (existing.length === 0) {
      await db.insert(barbersTable).values(b as any);
    }
  }

  const rows = await db.select().from(barbersTable);
  return rows;
}

async function seedAvailabilities(barbers: { id: number; name: string }[]) {
  // Mon–Fri 10:00–18:00, Sat 10:00–16:00, Sun off
  const windows = [
    { dayOfWeek: DayOfWeek.MONDAY, startTime: '10:00', endTime: '18:00' },
    { dayOfWeek: DayOfWeek.TUESDAY, startTime: '10:00', endTime: '18:00' },
    { dayOfWeek: DayOfWeek.WEDNESDAY, startTime: '10:00', endTime: '18:00' },
    { dayOfWeek: DayOfWeek.THURSDAY, startTime: '10:00', endTime: '18:00' },
    { dayOfWeek: DayOfWeek.FRIDAY, startTime: '10:00', endTime: '18:00' },
    { dayOfWeek: DayOfWeek.SATURDAY, startTime: '10:00', endTime: '16:00' },
  ];

  for (const barber of barbers) {
    for (const w of windows) {
      const exists = await db
        .select({ id: availabilitiesTable.id })
        .from(availabilitiesTable)
        .where(
          and(
            eq(availabilitiesTable.barberId, barber.id),
            eq(availabilitiesTable.dayOfWeek, w.dayOfWeek)
          )
        );
      if (exists.length === 0) {
        await db.insert(availabilitiesTable).values({
          barberId: barber.id,
          dayOfWeek: w.dayOfWeek,
          startTime: w.startTime,
          endTime: w.endTime,
          isActive: true,
        });
      }
    }
  }
}

function nextWeekday(targetDow: number) {
  // targetDow: 1=Mon ... 7=Sun for Date API; our DB uses 0=Mon ... 6=Sun
  const now = new Date();
  const dow = (now.getUTCDay() + 6) % 7; // 0=Mon ... 6=Sun
  const delta = (targetDow - dow + 7) % 7 || 7; // at least next week if today
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  d.setUTCDate(d.getUTCDate() + delta);
  return d; // midnight UTC of that day
}

async function seedSampleBooking(barberId: number) {
  // Pick next Wednesday at 15:00 for determinism
  const nextWed = nextWeekday(2); // 0=Mon,1=Tue,2=Wed
  const start = new Date(nextWed);
  start.setUTCHours(15, 0, 0, 0);

  const exists = await db
    .select({ id: bookingsTable.id })
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.barberId, barberId),
        eq(bookingsTable.appointmentDateTime, start)
      )
    );

  if (exists.length === 0) {
    await db.insert(bookingsTable).values({
      barberId,
      customerName: 'Seed User',
      customerEmail: 'seed@example.com',
      customerPhone: '+10000000000',
      serviceName: 'Classic Haircut',
      totalPrice: '35.00',
      durationMinutes: 30,
      appointmentDateTime: start,
      status: 'confirmed',
      notes: 'Seeded booking',
      clerkUserId: null,
    });
  }
}

async function main() {
  console.log('🌱 Seeding database...');
  const services = await seedServices();
  const barbers = await seedBarbers();
  await seedAvailabilities(
    barbers.map(b => ({ id: (b as any).id, name: (b as any).name }))
  );
  if (barbers.length > 0) {
    await seedSampleBooking((barbers[0] as any).id);
  }
  console.log('✅ Seeding complete');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seed failed', err);
  process.exit(1);
});
