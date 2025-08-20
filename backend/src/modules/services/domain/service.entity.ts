export interface ServiceEntity {
  id: number;
  name: string;
  description: string;
  // Domain models money as integer cents
  priceCents: number;
  durationMinutes: number;
  category: string;
  isActive: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
