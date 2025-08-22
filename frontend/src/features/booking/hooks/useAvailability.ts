import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type AvailabilitySlot = {
  start: string; // ISO
  end: string; // ISO
  available: true;
};

export type UseAvailabilityParams = {
  date?: string; // 'YYYY-MM-DD'
  serviceId?: number; // required
  barberId?: number; // required
};

export function useAvailability(params: UseAvailabilityParams) {
  const { date, serviceId, barberId } = params;
  const enabled = Boolean(date && serviceId && barberId);

  return useQuery({
    queryKey: ['availability', { date, serviceId, barberId }],
    queryFn: async () =>
      api.get<AvailabilitySlot[]>('/availability', {
        date,
        serviceId,
        barberId,
      }),
    enabled,
    staleTime: 60_000,
  });
}
