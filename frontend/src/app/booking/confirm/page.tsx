'use client';

import { useAuth, useUser, useClerk } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaCut,
  FaCheckCircle,
} from 'react-icons/fa';
import { useCreateBooking } from '@/features/booking/hooks/useCreateBooking';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  useBookingStore,
  type BookingDraft,
  type BookingState,
} from '@/features/booking/state/bookingStore';
import {
  validateBookingDraft,
  validatePhone,
} from '@/features/booking/utils/validation';

export default function BookingConfirmPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { redirectToSignIn } = useClerk();
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const booking = useBookingStore((s: BookingState) => s.draft);
  const clearDraft = useBookingStore((s: BookingState) => s.clearDraft);
  // Wait for persisted store to hydrate before making redirect decisions
  const hasHydrated = useBookingStore.persist.hasHydrated();
  const [phone, setPhone] = useState('');
  const phoneErr = validatePhone(phone);
  const isDraftValid = booking
    ? validateBookingDraft(booking).length === 0
    : false;
  const isFormValid = isDraftValid && !phoneErr;

  const { mutateAsync: createBooking } = useCreateBooking(getToken);

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated. After sign-in, return to /booking;
  // booking page will restore selections from persisted state manager (Zustand).
  if (!isSignedIn) {
    redirectToSignIn({ redirectUrl: '/sign-in?redirect_url=/booking' });
    return null;
  }

  // moved phone state above for validation

  const handleConfirmBooking = async () => {
    setIsConfirming(true);
    setError(null);

    try {
      if (!booking) {
        setError('Missing booking details. Please go back and try again.');
        return;
      }
      const draftErrors = validateBookingDraft(booking);
      const phoneError = validatePhone(phone);
      if (draftErrors.length > 0 || phoneError) {
        const first = phoneError ?? draftErrors[0];
        setError(first.message);
        return;
      }
      const result = await createBooking({
        barberId: booking.barberId,
        appointmentDateTime: booking.slotStart,
        durationMinutes: booking.durationMinutes,
        customerName:
          user.fullName ||
          `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
        customerEmail: user.emailAddresses[0]?.emailAddress || '',
        customerPhone: phone.trim(),
        serviceName: booking.serviceName,
        totalPrice: String(booking.price).replace(/[^0-9.]/g, ''),
      });
      setBookingId(result?.id ?? null);
      // Do not clear draft yet; keep it until user acknowledges so data remains visible
      setIsConfirmed(true);
    } catch (error) {
      console.error('Error confirming appointment:', error);
      const msg =
        error instanceof Error
          ? error.message
          : 'Failed to confirm appointment';
      if (
        typeof msg === 'string' &&
        (msg.includes('409') ||
          msg.toLowerCase().includes('conflict') ||
          msg.includes('Time slot is already booked'))
      ) {
        setError(
          'That time slot was just booked by someone else. Please pick another time.'
        );
      } else if (typeof msg === 'string' && msg.includes('400')) {
        setError('Invalid booking details. Please review and try again.');
      } else {
        setError(msg);
      }
    } finally {
      setIsConfirming(false);
    }
  };

  // If no draft, redirect user back to booking page (only after hydration and not on success screen)
  useEffect(() => {
    if (hasHydrated && !isConfirmed && !booking && isLoaded && isSignedIn) {
      router.replace('/booking');
    }
  }, [hasHydrated, isConfirmed, booking, isLoaded, isSignedIn, router]);

  // While store is hydrating, show a lightweight loading state to avoid flicker/redirect
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-luxury-navy flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/40 rounded-2xl p-8 shadow-2xl">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
            <h1 className="text-3xl font-serif text-luxury-cream mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-slate-300 mb-6">
              Your appointment has been successfully booked. We&apos;ll send you
              a confirmation email shortly.
            </p>
            {bookingId && (
              <p className="text-slate-400 text-sm mb-6">
                Booking ID: <span className="text-slate-200">#{bookingId}</span>
              </p>
            )}
            <button
              onClick={() => {
                clearDraft();
                router.push('/bookings');
              }}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 font-semibold py-3 px-6 rounded-full transition-all duration-200 hover:scale-[1.02] shadow-lg"
            >
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-navy">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-luxury-cream mb-2">
            Confirm Your Appointment
          </h1>
          <p className="text-slate-300">
            Review your booking details and confirm
          </p>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/40 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200">
              {error}
            </div>
          )}
          {/* User Info */}
          <div className="mb-8 p-4 bg-slate-800/30 rounded-xl">
            <h2 className="text-xl font-semibold text-luxury-cream mb-3 flex items-center gap-2">
              <FaUser className="text-amber-400" />
              Client Information
            </h2>
            <div className="space-y-2 text-slate-300">
              <p>
                <span className="font-medium">Name:</span>{' '}
                {user.fullName || `${user.firstName} ${user.lastName}`}
              </p>
              <p>
                <span className="font-medium">Email:</span>{' '}
                {user.emailAddresses[0]?.emailAddress}
              </p>
              <div className="pt-3">
                <label
                  className="block text-sm text-slate-400 mb-1"
                  htmlFor="phone"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +15551234567"
                  className={`w-full rounded-lg bg-slate-800 border px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 ${
                    phone && phoneErr
                      ? 'border-red-500 focus:ring-red-400/50'
                      : 'border-slate-700 focus:ring-amber-400/50'
                  }`}
                />
                {phone && phoneErr && (
                  <p className="mt-2 text-sm text-red-300">
                    {phoneErr.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-luxury-cream mb-6 flex items-center gap-2">
              <FaCut className="text-amber-400" />
              Appointment Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaCut className="text-amber-400 text-lg" />
                  <div>
                    <p className="text-slate-400 text-sm">Service</p>
                    <p className="text-luxury-cream font-medium">
                      {booking?.serviceName || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaUser className="text-amber-400 text-lg" />
                  <div>
                    <p className="text-slate-400 text-sm">Barber</p>
                    <p className="text-luxury-cream font-medium">
                      {booking?.barberName || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-amber-400 text-lg" />
                  <div>
                    <p className="text-slate-400 text-sm">Date</p>
                    <p className="text-luxury-cream font-medium">
                      {booking
                        ? new Date(booking.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaClock className="text-amber-400 text-lg" />
                  <div>
                    <p className="text-slate-400 text-sm">Time</p>
                    <p className="text-luxury-cream font-medium">
                      {booking
                        ? `${new Date(booking.slotStart).toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )} (${booking.durationMinutes} min)`
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="mb-8 p-4 bg-slate-800/30 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-lg">Total Amount</span>
              <span className="text-amber-400 text-2xl font-bold">
                {booking?.price || '-'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-luxury-cream font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02]"
              disabled={isConfirming}
            >
              Go Back
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={isConfirming || !isFormValid}
              className="flex-1 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 font-semibold py-3 px-6 rounded-full transition-all duration-200 hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-charcoal"></div>
                  Confirming...
                </span>
              ) : (
                'Confirm Appointment'
              )}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
