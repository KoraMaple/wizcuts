'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaCut,
  FaArrowRight,
} from 'react-icons/fa';
import { useServices } from '@/features/booking/hooks/useServices';
import { useBarbers } from '@/features/booking/hooks/useBarbers';
import { useAvailability } from '@/features/booking/hooks/useAvailability';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  useBookingStore,
  type BookingDraft,
} from '@/features/booking/state/bookingStore';
import Calendar from '@/components/Calendar';

interface BookingData {
  serviceId: number | '';
  barberId: number | '';
  date: string;
  slotStartIso: string;
}

export default function BookingPage() {
  const router = useRouter();
  const setDraft = useBookingStore(
    (s: { setDraft: (d: BookingDraft) => void }) => s.setDraft
  );
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: '',
    barberId: '',
    date: '',
    slotStartIso: '',
  });

  const { data: services, isLoading: loadingServices } = useServices();
  const { data: barbers, isLoading: loadingBarbers } = useBarbers();

  const { data: slots, isFetching: loadingSlots } = useAvailability({
    date: bookingData.date || undefined,
    serviceId:
      typeof bookingData.serviceId === 'number'
        ? bookingData.serviceId
        : undefined,
    barberId:
      typeof bookingData.barberId === 'number'
        ? bookingData.barberId
        : undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields are selected
    if (
      !bookingData.serviceId ||
      !bookingData.barberId ||
      !bookingData.date ||
      !bookingData.slotStartIso
    ) {
      alert('Please select all booking details');
      return;
    }

    const selectedService = services?.find(s => s.id === bookingData.serviceId);
    const selectedBarber = barbers?.find(b => b.id === bookingData.barberId);
    // Store booking payload in zustand (persisted to sessionStorage) and navigate without query params
    const payload: BookingDraft = {
      serviceName: selectedService?.name || '',
      barberId: Number(bookingData.barberId),
      barberName: selectedBarber?.name || '',
      date: bookingData.date,
      slotStart: bookingData.slotStartIso,
      durationMinutes: selectedService ? selectedService.durationMinutes : 0,
      price: selectedService?.basePrice || '',
    };
    setDraft(payload);

    router.push('/booking/confirm');
  };

  const canPickSlot =
    !!bookingData.serviceId && !!bookingData.barberId && !!bookingData.date;
  const isReady = canPickSlot && !!bookingData.slotStartIso;

  const formattedSlots = useMemo(() => {
    if (!slots) return [] as { startIso: string; label: string }[];
    return slots.map(s => ({
      startIso: s.start,
      label: new Date(s.start).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));
  }, [slots]);

  return (
    <div className="min-h-screen bg-luxury-navy">
      <Header />
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-luxury-cream mb-2">
            Book Your Appointment
          </h1>
          <p className="text-slate-300">
            Select your preferred service, barber, and time
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Selection */}
          <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/40 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-luxury-cream mb-6 flex items-center gap-2">
              <FaCut className="text-amber-400" />
              Select Service
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingServices && (
                <div className="text-slate-400">Loading services…</div>
              )}
              {services?.map(service => (
                <div
                  key={service.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    bookingData.serviceId === service.id
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'
                  }`}
                  onClick={() =>
                    setBookingData(prev => ({
                      ...prev,
                      serviceId: service.id,
                      slotStartIso: '',
                    }))
                  }
                >
                  <h3 className="text-luxury-cream font-semibold mb-2">
                    {service.name}
                  </h3>
                  <div className="flex justify-between text-slate-300">
                    <span>{service.durationMinutes} min</span>
                    <span className="text-amber-400 font-bold">
                      ${service.basePrice}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Barber Selection */}
          <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/40 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-luxury-cream mb-6 flex items-center gap-2">
              <FaUser className="text-amber-400" />
              Choose Your Barber
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loadingBarbers && (
                <div className="text-slate-400">Loading barbers…</div>
              )}
              {barbers?.map(barber => (
                <div
                  key={barber.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    bookingData.barberId === barber.id
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'
                  }`}
                  onClick={() =>
                    setBookingData(prev => ({
                      ...prev,
                      barberId: barber.id,
                      slotStartIso: '',
                    }))
                  }
                >
                  <h3 className="text-luxury-cream font-semibold mb-2">
                    {barber.name}
                  </h3>
                  <p className="text-slate-300 text-sm">{barber.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Date & Time Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/40 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-semibold text-luxury-cream mb-6 flex items-center gap-2">
                <FaCalendarAlt className="text-amber-400" />
                Select Date
              </h2>
              <Calendar
                value={bookingData.date}
                onChange={date =>
                  setBookingData(prev => ({ ...prev, date, slotStartIso: '' }))
                }
              />
            </div>

            {/* Time Selection */}
            <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/40 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-semibold text-luxury-cream mb-6 flex items-center gap-2">
                <FaClock className="text-amber-400" />
                Select Time
              </h2>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto scrollbar-luxury pr-2">
                {!canPickSlot && (
                  <div className="text-slate-400 col-span-2">
                    Select service, barber, and date to see available slots.
                  </div>
                )}
                {loadingSlots && (
                  <div className="text-slate-400">Loading slots…</div>
                )}
                {canPickSlot &&
                  formattedSlots.map(slot => (
                    <button
                      type="button"
                      key={slot.startIso}
                      className={`p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] text-center focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                        bookingData.slotStartIso === slot.startIso
                          ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                          : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-500'
                      }`}
                      onClick={() =>
                        setBookingData(prev => ({
                          ...prev,
                          slotStartIso: slot.startIso,
                        }))
                      }
                    >
                      {slot.label}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={!isReady}
              className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 font-semibold py-4 px-8 rounded-full transition-all duration-200 hover:scale-[1.02] shadow-lg flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Confirmation
              <FaArrowRight />
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
