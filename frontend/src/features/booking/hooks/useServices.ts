import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type Service = {
  id: number;
  name: string;
  description: string;
  basePrice: string;
  durationMinutes: number;
  category: string;
  isActive: boolean;
  image: string | null;
};

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => api.get<Service[]>('/services'),
    staleTime: 2 * 60_000,
  });
}
