import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type CreateBookingInput = {
  barberId: number;
  appointmentDateTime: string; // ISO start time
  durationMinutes: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  totalPrice: string; // number as string, e.g. "35.00"
  notes?: string;
};

export type BookingResponse = {
  id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  barberId: number;
  startTime: string;
  endTime: string;
};

export function useCreateBooking(getToken?: () => Promise<string | null>) {
  return useMutation({
    mutationFn: async (data: CreateBookingInput) => {
      const token = getToken ? await getToken() : null;
      return api.post<BookingResponse>(
        '/bookings',
        data,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
    },
  });
}
