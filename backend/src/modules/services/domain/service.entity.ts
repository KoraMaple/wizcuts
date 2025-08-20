export interface ServiceItem {
  id: number;
  name: string;
  description?: string;
  priceCents: number;
  durationMinutes: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
