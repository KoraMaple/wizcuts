export interface Booking {
  id: number;
  customerName: string;
  customerEmail?: string;
  serviceId: number;
  barberId: number;
  startTime: Date;
  endTime: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
