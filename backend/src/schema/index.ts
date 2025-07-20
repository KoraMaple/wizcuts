import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  json,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const barbers = pgTable('barbers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  title: varchar('title', { length: 50 }).notNull(),
  bio: text('bio').notNull(),
  image: varchar('image', { length: 255 }).notNull(),
  experienceYears: integer('experience_years').default(0).notNull(),
  specialties: json('specialties').$type<string[]>(),
  rating: decimal('rating', { precision: 3, scale: 2 })
    .default('0.00')
    .notNull(),
  reviewCount: integer('review_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  phone: varchar('phone', { length: 15 }),
  email: varchar('email', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const barbersRelations = relations(barbers, ({ many }) => ({
  bookings: many(bookings),
  services: many(barberServices),
  availabilities: many(availabilities),
}));

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  basePrice: decimal('base_price', { precision: 8, scale: 2 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  image: varchar('image', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const servicesRelations = relations(services, ({ many }) => ({
  barberServices: many(barberServices),
}));

export const barberServices = pgTable('barber_services', {
  id: serial('id').primaryKey(),
  barberId: integer('barber_id').notNull(),
  serviceId: integer('service_id').notNull(),
  customPrice: decimal('custom_price', { precision: 8, scale: 2 }),
  customDurationMinutes: integer('custom_duration_minutes'),
  isAvailable: boolean('is_available').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const barberServicesRelations = relations(barberServices, ({ one }) => ({
  barber: one(barbers, {
    fields: [barberServices.barberId],
    references: [barbers.id],
  }),
  service: one(services, {
    fields: [barberServices.serviceId],
    references: [services.id],
  }),
}));

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  barberId: integer('barber_id').notNull(),
  customerName: varchar('customer_name', { length: 100 }).notNull(),
  customerEmail: varchar('customer_email', { length: 100 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 15 }).notNull(),
  serviceName: varchar('service_name', { length: 100 }).notNull(),
  totalPrice: decimal('total_price', { precision: 8, scale: 2 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  appointmentDateTime: timestamp('appointment_date_time').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  notes: text('notes'),
  // Clerk user ID for authenticated bookings
  clerkUserId: varchar('clerk_user_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
  barber: one(barbers, {
    fields: [bookings.barberId],
    references: [barbers.id],
  }),
}));

export const availabilities = pgTable('availabilities', {
  id: serial('id').primaryKey(),
  barberId: integer('barber_id').notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Monday, 6 = Sunday
  startTime: varchar('start_time', { length: 5 }).notNull(), // HH:MM format
  endTime: varchar('end_time', { length: 5 }).notNull(), // HH:MM format
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const availabilitiesRelations = relations(availabilities, ({ one }) => ({
  barber: one(barbers, {
    fields: [availabilities.barberId],
    references: [barbers.id],
  }),
}));

// Types
export type Barber = typeof barbers.$inferSelect;
export type NewBarber = typeof barbers.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type BarberService = typeof barberServices.$inferSelect;
export type NewBarberService = typeof barberServices.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

export type Availability = typeof availabilities.$inferSelect;
export type NewAvailability = typeof availabilities.$inferInsert;

// Enums
export const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type BookingStatusType =
  (typeof BookingStatus)[keyof typeof BookingStatus];

export const DayOfWeek = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
  SUNDAY: 6,
} as const;

export type DayOfWeekType = (typeof DayOfWeek)[keyof typeof DayOfWeek];
