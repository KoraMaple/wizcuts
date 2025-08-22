CREATE TABLE IF NOT EXISTS "availabilities" (
  "id" serial PRIMARY KEY NOT NULL,
  "barber_id" integer NOT NULL,
  "day_of_week" integer NOT NULL,
  "start_time" varchar(5) NOT NULL,
  "end_time" varchar(5) NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "barber_services" (
  "id" serial PRIMARY KEY NOT NULL,
  "barber_id" integer NOT NULL,
  "service_id" integer NOT NULL,
  "custom_price" numeric(8, 2),
  "custom_duration_minutes" integer,
  "is_available" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "barbers" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(100) NOT NULL,
  "title" varchar(50) NOT NULL,
  "bio" text NOT NULL,
  "image" varchar(255) NOT NULL,
  "experience_years" integer DEFAULT 0 NOT NULL,
  "specialties" json,
  "rating" numeric(3, 2) DEFAULT '0.00' NOT NULL,
  "review_count" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "phone" varchar(15),
  "email" varchar(100),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookings" (
  "id" serial PRIMARY KEY NOT NULL,
  "barber_id" integer NOT NULL,
  "customer_name" varchar(100) NOT NULL,
  "customer_email" varchar(100) NOT NULL,
  "customer_phone" varchar(15) NOT NULL,
  "service_name" varchar(100) NOT NULL,
  "total_price" numeric(8, 2) NOT NULL,
  "duration_minutes" integer NOT NULL,
  "appointment_date_time" timestamp NOT NULL,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "notes" text,
  "clerk_user_id" varchar(100),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "services" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(100) NOT NULL,
  "description" text NOT NULL,
  "base_price" numeric(8, 2) NOT NULL,
  "duration_minutes" integer NOT NULL,
  "category" varchar(50) NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "image" varchar(255),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);