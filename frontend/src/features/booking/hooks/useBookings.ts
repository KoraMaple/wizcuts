import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type BookingListItem = {
  id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  barberId: number;
  barberName?: string;
  serviceName?: string;
  startTime: string; // ISO
  endTime: string; // ISO
  totalPrice?: string;
};

export function useBookings(getToken?: () => Promise<string | null>) {
  return useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const token = getToken ? await getToken() : null;
      // Use user-specific endpoint which includes barberName
      return api.get<BookingListItem[]>(
        '/bookings/user/appointments',
        undefined,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
    },
    staleTime: 30_000,
  });
}
