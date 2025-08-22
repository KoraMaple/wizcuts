'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useBookings } from '@/features/booking/hooks/useBookings';
import { useCancelBooking } from '@/features/booking/hooks/useCancelBooking';
import { useRescheduleBooking } from '@/features/booking/hooks/useRescheduleBooking';
import { FaCalendarAlt, FaClock, FaCut, FaUser } from 'react-icons/fa';
import { useMemo, useState } from 'react';
import Calendar from '@/components/Calendar';

export default function BookingsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { data, isLoading, isError, error, refetch } = useBookings(getToken);
  const { mutateAsync: cancelBooking, isPending: cancelling } =
    useCancelBooking(getToken);
  const { mutateAsync: rescheduleBooking, isPending: rescheduling } =
    useRescheduleBooking(getToken);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [newStart, setNewStart] = useState<string>(''); // ISO value
  const [newDate, setNewDate] = useState<string>(''); // YYYY-MM-DD
  const [newTime, setNewTime] = useState<string>(''); // HH:MM

  const items = useMemo(() => {
    return (data ?? []).map(b => {
      const startIso = b.startTime || (b as any).appointmentDateTime || '';
      const endIso = b.endTime || (b as any).appointmentEndTime || '';
      const durationMin = (b as any).durationMinutes as number | undefined;
      const normalizedEnd =
        endIso ||
        (startIso && durationMin
          ? new Date(
              new Date(startIso).getTime() + durationMin * 60000
            ).toISOString()
          : '');
      return {
        id: b.id,
        status: b.status,
        serviceName: b.serviceName || (b as any).service?.name || '-',
        barberName: b.barberName || (b as any).barber?.name || '-',
        startTime: startIso,
        endTime: normalizedEnd,
        totalPrice: (b as any).totalPrice || (b as any).price || '',
        raw: b,
      };
    });
  }, [data]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-luxury-navy flex items-center justify-center">
        <div className="text-slate-300">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    // Rely on middleware if present; otherwise a simple message
    return (
      <div className="min-h-screen bg-luxury-navy flex items-center justify-center">
        <div className="text-slate-300">
          Please sign in to view your bookings.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-navy">
      <Header />
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-luxury-cream mb-2">
            My Bookings
          </h1>
          <p className="text-slate-300">View and manage your appointments</p>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/40 rounded-2xl p-6 shadow-2xl">
          {isLoading && <div className="text-slate-300">Loading bookings…</div>}
          {isError && (
            <div className="text-red-300">
              Failed to load bookings.{' '}
              {error instanceof Error ? error.message : ''}
              <button className="ml-3 underline" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          )}

          {!isLoading && items && items.length === 0 && (
            <div className="text-slate-300">You have no bookings yet.</div>
          )}

          {items && items.length > 0 && (
            <ul className="space-y-4">
              {items.map(b => (
                <li
                  key={b.id}
                  className="p-4 rounded-xl border border-slate-700 bg-slate-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <FaCut className="text-amber-400" />
                      <div>
                        <p className="text-slate-400 text-sm">Service</p>
                        <p className="text-luxury-cream font-medium">
                          {b.serviceName || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaUser className="text-amber-400" />
                      <div>
                        <p className="text-slate-400 text-sm">Barber</p>
                        <p className="text-luxury-cream font-medium">
                          {b.barberName || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-amber-400" />
                      <div>
                        <p className="text-slate-400 text-sm">Date</p>
                        <p className="text-luxury-cream font-medium">
                          {b.startTime
                            ? new Date(b.startTime).toLocaleDateString(
                                'en-US',
                                {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )
                            : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaClock className="text-amber-400" />
                      <div>
                        <p className="text-slate-400 text-sm">Time</p>
                        <p className="text-luxury-cream font-medium">
                          {b.startTime
                            ? new Date(b.startTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}{' '}
                          {b.endTime
                            ? `– ${new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-semibold border"
                      data-status={b.status}
                    >
                      {b.status.toUpperCase()}
                    </span>
                    {b.totalPrice && (
                      <div className="text-amber-400 font-bold mt-2">
                        ${b.totalPrice}
                      </div>
                    )}

                    {(b.status === 'pending' || b.status === 'confirmed') && (
                      <div className="flex gap-2 justify-end">
                        <button
                          className="px-3 py-1.5 rounded-lg border border-red-500/50 text-red-200 hover:bg-red-500/10 disabled:opacity-50"
                          disabled={cancelling}
                          onClick={async () => {
                            await cancelBooking(b.id);
                          }}
                        >
                          {cancelling ? 'Cancelling…' : 'Cancel'}
                        </button>
                        <button
                          className="px-3 py-1.5 rounded-lg border border-amber-400/50 text-amber-300 hover:bg-amber-400/10 disabled:opacity-50"
                          disabled={rescheduling}
                          onClick={() => {
                            setEditingId(editingId === b.id ? null : b.id);
                            // Prefill current date/time for better UX
                            if (b.startTime) {
                              const d = new Date(b.startTime);
                              const y = d.getFullYear();
                              const m = String(d.getMonth() + 1).padStart(
                                2,
                                '0'
                              );
                              const day = String(d.getDate()).padStart(2, '0');
                              const hh = String(d.getHours()).padStart(2, '0');
                              const mm = String(d.getMinutes()).padStart(
                                2,
                                '0'
                              );
                              setNewDate(`${y}-${m}-${day}`);
                              setNewTime(`${hh}:${mm}`);
                              setNewStart(
                                new Date(
                                  `${y}-${m}-${day}T${hh}:${mm}:00`
                                ).toISOString()
                              );
                            } else {
                              setNewDate('');
                              setNewTime('');
                              setNewStart('');
                            }
                          }}
                        >
                          {editingId === b.id ? 'Close' : 'Reschedule'}
                        </button>
                      </div>
                    )}

                    {editingId === b.id && (
                      <div className="mt-2 p-3 rounded-lg border border-slate-700 bg-slate-900/70">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:items-start">
                          <div className="min-w-0 w-full md:max-w-[320px] relative z-10">
                            <label className="block text-sm text-slate-300 mb-2">
                              Select Date
                            </label>
                            <Calendar
                              value={newDate}
                              onChange={date => {
                                setNewDate(date);
                                // Keep last selected time if present
                                if (date && newTime) {
                                  const iso = new Date(
                                    `${date}T${newTime}:00`
                                  ).toISOString();
                                  setNewStart(iso);
                                }
                              }}
                            />
                          </div>
                          <div className="min-w-0 w-full md:max-w-[240px] relative z-0">
                            <label className="block text-sm text-slate-300 mb-2">
                              Select Time
                            </label>
                            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                              {Array.from({ length: 20 }).map((_, idx) => {
                                // 09:00 to 18:30 in 30-minute steps (20 slots)
                                const baseMinutes = 9 * 60; // 540
                                const minutes = baseMinutes + idx * 30;
                                const hh = String(
                                  Math.floor(minutes / 60)
                                ).padStart(2, '0');
                                const mm = String(minutes % 60).padStart(
                                  2,
                                  '0'
                                );
                                const label = `${hh}:${mm}`;
                                const selected = newTime === label;
                                return (
                                  <button
                                    key={label}
                                    type="button"
                                    className={`p-2 rounded-lg border transition-all duration-200 text-center ${
                                      selected
                                        ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                                        : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-500'
                                    }`}
                                    onClick={() => {
                                      setNewTime(label);
                                      if (newDate) {
                                        const iso = new Date(
                                          `${newDate}T${label}:00`
                                        ).toISOString();
                                        setNewStart(iso);
                                      }
                                    }}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <button
                            className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700/50"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-3 py-1.5 rounded-lg border border-amber-400/50 text-amber-300 hover:bg-amber-400/10 disabled:opacity-50"
                            disabled={rescheduling || !newDate || !newTime}
                            onClick={async () => {
                              if (!newDate || !newTime) return;
                              const iso = new Date(
                                `${newDate}T${newTime}:00`
                              ).toISOString();
                              await rescheduleBooking({
                                id: b.id,
                                startTime: iso,
                              });
                              setEditingId(null);
                            }}
                          >
                            {rescheduling ? 'Saving…' : 'Save'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
