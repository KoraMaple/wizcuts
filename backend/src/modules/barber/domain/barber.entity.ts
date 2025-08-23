export interface BarberEntity {
  id: number;
  name: string;
  title?: string | null;
  bio?: string | null;
  image?: string | null;
  experienceYears?: number | null;
  specialties?: string[] | null;
  rating: string; // keep decimal as string to match schema
  reviewCount: number;
  isActive: boolean;
  phone?: string | null;
  email?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
