'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaCut,
  FaPlus,
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
} from 'react-icons/fa';

interface Appointment {
  id: number;
  barberId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  totalPrice: string;
  durationMinutes: number;
  appointmentDateTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  clerkUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();

  // Redirect if not signed in (allow E2E to control via window.__CLERK_AUTH_STATE)
  useEffect(() => {
    const e2eSignedIn =
      typeof window !== 'undefined' &&
      (window as any).__CLERK_AUTH_STATE?.isSignedIn === true;
    if (!isSignedIn && !e2eSignedIn) {
      router.push('/sign-in?redirect_url=/appointments');
    }
  }, [isSignedIn, router]);

  // Resolve backend base URL (fallback to relative for E2E)
  const apiBase = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(
    /\/$/,
    ''
  );

  // Fetch user appointments
  const fetchAppointments = useCallback(async () => {
    try {
      let token = await getToken();
      // Fallback for E2E where tests inject window.__CLERK_AUTH_STATE.getToken
      if (!token && typeof window !== 'undefined') {
        const maybeGetToken = (window as any).__CLERK_AUTH_STATE?.getToken;
        if (typeof maybeGetToken === 'function') {
          token = await maybeGetToken();
        }
      }
      const response = await fetch(
        `${apiBase}/bookings/user/appointments`.replace(/^\//, '/'),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        console.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    const e2eSignedIn =
      typeof window !== 'undefined' &&
      (window as any).__CLERK_AUTH_STATE?.isSignedIn === true;
    if (isSignedIn || e2eSignedIn) {
      fetchAppointments();
    }
  }, [isSignedIn, fetchAppointments]);

  // Cancel appointment
  const cancelAppointment = async (appointmentId: number) => {
    setCancellingId(appointmentId);
    try {
      const token = await getToken();
      const response = await fetch(
        `${apiBase}/bookings/${appointmentId}/cancel`.replace(/^\//, '/'),
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        // Refresh appointments
        await fetchAppointments();
      } else {
        console.error('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancelAppointment = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.appointmentDateTime);
    const now = new Date();
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const hoursUntilAppointment = timeDiff / (1000 * 3600);

    return (
      appointment.status !== 'cancelled' &&
      appointment.status !== 'completed' &&
      hoursUntilAppointment > 24
    ); // Can only cancel if more than 24 hours away
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Appointments
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your upcoming and past appointments
              </p>
            </div>
            <button
              onClick={() => router.push('/booking')}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
            >
              <FaPlus className="text-sm" />
              Book New Appointment
            </button>
          </div>
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="text-center py-16">
            <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No appointments yet
            </h2>
            <p className="text-gray-600 mb-8">
              Book your first appointment to get started
            </p>
            <button
              onClick={() => router.push('/booking')}
              className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Book Your First Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map(appointment => (
              <div
                key={appointment.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Service and Status */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <FaCut className="text-gray-600" />
                        {appointment.serviceName}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}
                      >
                        {appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                      </span>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaCalendarAlt />
                        <span>
                          {formatDate(appointment.appointmentDateTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaClock />
                        <span>
                          {formatTime(appointment.appointmentDateTime)} (
                          {appointment.durationMinutes} min)
                        </span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaEnvelope />
                        <span>{appointment.customerEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaPhone />
                        <span>{appointment.customerPhone}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-gray-900">
                        ${appointment.totalPrice}
                      </span>
                    </div>

                    {/* Notes */}
                    {appointment.notes && (
                      <div className="mb-4">
                        <p className="text-gray-600">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-6">
                    {canCancelAppointment(appointment) && (
                      <button
                        onClick={() => cancelAppointment(appointment.id)}
                        disabled={cancellingId === appointment.id}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {cancellingId === appointment.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <FaTimes />
                            Cancel
                          </>
                        )}
                      </button>
                    )}

                    {appointment.status === 'confirmed' && (
                      <div className="flex items-center gap-2 text-green-600 mt-2">
                        <FaCheckCircle />
                        <span className="text-sm">Confirmed</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with booking details */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Booking ID: #{appointment.id}</span>
                    <span>Booked: {formatDate(appointment.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
