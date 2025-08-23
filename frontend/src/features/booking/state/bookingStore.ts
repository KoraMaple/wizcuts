import { create } from 'zustand';
import {
  persist,
  createJSONStorage,
  type PersistOptions,
} from 'zustand/middleware';

export type BookingDraft = {
  serviceName: string;
  barberId: number;
  barberName: string;
  date: string; // YYYY-MM-DD
  slotStart: string; // ISO
  durationMinutes: number;
  price: string; // display price, still normalized on submit
};

export interface BookingState {
  draft: BookingDraft | null;
  setDraft: (draft: BookingDraft) => void;
  clearDraft: () => void;
}

type SetState<T> = (
  partial: Partial<T> | ((state: T) => Partial<T>),
  replace?: boolean
) => void;

const creator = (set: SetState<BookingState>) => ({
  draft: null,
  setDraft: (draft: BookingDraft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
});

const persistOptions: PersistOptions<
  BookingState,
  { draft: BookingDraft | null }
> = {
  name: 'wizcuts.booking.pending',
  storage: createJSONStorage(() => sessionStorage),
  version: 1,
  partialize: (state: BookingState) => ({ draft: state.draft }),
};

export const useBookingStore = create<BookingState>()(
  persist(creator, persistOptions)
);
