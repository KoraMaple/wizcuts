import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type Barber = {
  id: number;
  name: string;
  title: string;
  bio: string;
  image: string;
  experienceYears: number;
  specialties: string[] | null;
  rating: string;
  reviewCount: number;
  isActive: boolean;
};

export function useBarbers() {
  return useQuery({
    queryKey: ['barbers'],
    queryFn: async () => api.get<Barber[]>('/barbers'),
    staleTime: 2 * 60_000,
  });
}
