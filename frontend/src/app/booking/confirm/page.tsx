'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaCut,
  FaCheckCircle,
} from 'react-icons/fa';

interface BookingDetails {
  service: string;
  barber: string;
  date: string;
  time: string;
  duration: string;
  price: string;
}

export default function BookingConfirmPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Get booking details from URL params or localStorage
  const [bookingDetails] = useState<BookingDetails>(() => {
    // In a real app, you'd get this from URL params or localStorage
    return {
      service: searchParams.get('service') || 'Premium Cut & Style',
      barber: searchParams.get('barber') || 'Michael Rodriguez',
      date: searchParams.get('date') || '2024-01-15',
      time: searchParams.get('time') || '2:00 PM',
      duration: '45 minutes',
      price: '$85',
    };
  });

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

  // Redirect to sign-in if not authenticated (backup to middleware)
  if (!isSignedIn) {
    router.push('/sign-in?redirect_url=/booking/confirm');
    return null;
  }

  const handleConfirmBooking = async () => {
    setIsConfirming(true);

    try {
      // Call backend API to save appointment
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingDetails,
          userId: user.id,
          userEmail: user.emailAddresses[0]?.emailAddress,
          userName: user.fullName || `${user.firstName} ${user.lastName}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm appointment');
      }

      setIsConfirmed(true);
    } catch (error) {
      console.error('Error confirming appointment:', error);
      // Handle error appropriately
    } finally {
      setIsConfirming(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-charcoal/50 backdrop-blur-sm border border-slate-600/20 rounded-2xl p-8 shadow-2xl">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
            <h1 className="text-3xl font-serif text-cream mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-slate-300 mb-6">
              Your appointment has been successfully booked. We&apos;ll send you
              a confirmation email shortly.
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gold hover:bg-gold/90 text-charcoal font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-cream mb-2">
            Confirm Your Appointment
          </h1>
          <p className="text-slate-300">
            Review your booking details and confirm
          </p>
        </div>

        <div className="bg-charcoal/50 backdrop-blur-sm border border-slate-600/20 rounded-2xl p-8 shadow-2xl">
          {/* User Info */}
          <div className="mb-8 p-4 bg-slate-800/30 rounded-xl">
            <h2 className="text-xl font-semibold text-cream mb-3 flex items-center gap-2">
              <FaUser className="text-gold" />
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
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-cream mb-6 flex items-center gap-2">
              <FaCut className="text-gold" />
              Appointment Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaCut className="text-gold text-lg" />
                  <div>
                    <p className="text-slate-400 text-sm">Service</p>
                    <p className="text-cream font-medium">
                      {bookingDetails.service}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaUser className="text-gold text-lg" />
                  <div>
                    <p className="text-slate-400 text-sm">Barber</p>
                    <p className="text-cream font-medium">
                      {bookingDetails.barber}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-gold text-lg" />
                  <div>
                    <p className="text-slate-400 text-sm">Date</p>
                    <p className="text-cream font-medium">
                      {new Date(bookingDetails.date).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaClock className="text-gold text-lg" />
                  <div>
                    <p className="text-slate-400 text-sm">Time</p>
                    <p className="text-cream font-medium">
                      {bookingDetails.time} ({bookingDetails.duration})
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
              <span className="text-gold text-2xl font-bold">
                {bookingDetails.price}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-cream font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02]"
              disabled={isConfirming}
            >
              Go Back
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={isConfirming}
              className="flex-1 bg-gold hover:bg-gold/90 text-charcoal font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
