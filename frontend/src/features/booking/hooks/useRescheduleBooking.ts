import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type ReschedulePayload = {
  id: number;
  startTime: string; // ISO string
};

export function useRescheduleBooking(getToken?: () => Promise<string | null>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, startTime }: ReschedulePayload) => {
      const token = getToken ? await getToken() : null;
      // PATCH /bookings/:id accepts { appointmentDateTime }
      const body = { appointmentDateTime: startTime } as const;
      return api.patch(
        `/bookings/${id}`,
        body,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
}
