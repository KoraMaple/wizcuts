import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useCancelBooking(getToken?: () => Promise<string | null>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: number) => {
      const token = getToken ? await getToken() : null;
      // Assuming DELETE /bookings/:id cancels a booking
      return api.del(
        `/bookings/${bookingId}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
}
