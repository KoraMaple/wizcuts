'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Star, X, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { useServices } from '@/features/booking/hooks/useServices';
import { useRouter } from 'next/navigation';
import {
  useBookingStore,
  type BookingDraft,
} from '@/features/booking/state/bookingStore';

const defaultServices = [
  {
    id: 'signature-cut',
    name: 'Signature Cut',
    duration: 45,
    price: 85,
    description: 'Precision haircut tailored to your style',
  },
  {
    id: 'traditional-shave',
    name: 'Traditional Shave',
    duration: 30,
    price: 65,
    description: 'Classic hot towel shave experience',
  },
  {
    id: 'color-styling',
    name: 'Color & Styling',
    duration: 90,
    price: 120,
    description: 'Expert color and professional styling',
  },
  {
    id: 'vip-experience',
    name: 'VIP Experience',
    duration: 120,
    price: 200,
    description: 'Complete luxury grooming package',
  },
];

const barbers = [
  {
    id: 'marcus-steel',
    name: 'Marcus Steel',
    title: 'Master Barber & Owner',
    experience: '15+ years',
    specialties: ['Classic Cuts', 'Beard Sculpting', 'Traditional Shaves'],
    rating: 4.9,
    reviews: 342,
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    bio: 'Marcus founded WizCuts with a vision to bring timeless barbering traditions to the modern gentleman.',
    availability: {
      '2025-07-18': ['9:00', '10:30', '2:00', '3:30'],
      '2025-07-19': ['9:00', '11:00', '1:00', '4:00'],
      '2025-07-21': ['10:00', '11:30', '2:30', '4:00'],
      '2025-07-22': ['9:30', '1:00', '3:00', '5:00'],
      '2025-07-23': ['9:00', '10:30', '2:00', '4:30'],
    },
  },
  {
    id: 'alessandro-rivera',
    name: 'Alessandro Rivera',
    title: 'Senior Stylist',
    experience: '12+ years',
    specialties: ['Modern Cuts', 'Color Techniques', 'Styling'],
    rating: 4.8,
    reviews: 289,
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    bio: 'Alessandro brings European flair and cutting-edge techniques to every client experience.',
    availability: {
      '2025-07-18': ['9:30', '11:00', '1:30', '4:00'],
      '2025-07-19': ['10:00', '12:00', '2:30', '4:30'],
      '2025-07-21': ['9:00', '11:30', '1:00', '3:30'],
      '2025-07-22': ['10:30', '1:30', '3:30', '5:30'],
      '2025-07-23': ['9:30', '11:00', '2:30', '4:00'],
    },
  },
  {
    id: 'james-wright',
    name: 'James Wright',
    title: 'Precision Specialist',
    experience: '8+ years',
    specialties: ['Fade Cuts', 'Line Work', 'Contemporary Styles'],
    rating: 4.7,
    reviews: 195,
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    bio: 'James specializes in precision cuts and contemporary styling for the modern professional.',
    availability: {
      '2025-07-18': ['10:00', '12:30', '3:00', '5:00'],
      '2025-07-19': ['9:30', '11:30', '2:00', '4:00'],
      '2025-07-21': ['10:30', '12:00', '2:30', '5:00'],
      '2025-07-22': ['9:00', '11:00', '2:00', '4:30'],
      '2025-07-23': ['10:00', '1:00', '3:30', '5:30'],
    },
  },
  {
    id: 'david-chen',
    name: 'David Chen',
    title: 'Style Innovator',
    experience: '10+ years',
    specialties: ['Asian Hair Techniques', 'Texture Work', 'Creative Styling'],
    rating: 4.9,
    reviews: 267,
    image:
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face',
    bio: 'David combines traditional Asian techniques with modern innovation for unique, personalized looks.',
    availability: {
      '2025-07-18': ['9:00', '11:30', '2:30', '4:30'],
      '2025-07-19': ['10:30', '12:30', '3:00', '5:00'],
      '2025-07-21': ['9:30', '11:00', '1:30', '4:00'],
      '2025-07-22': ['10:00', '12:00', '2:30', '5:30'],
      '2025-07-23': ['9:00', '11:30', '3:00', '4:30'],
    },
  },
];

export default function Booking() {
  const { show } = useToast();
  const router = useRouter();
  const { data: apiServices } = useServices();
  const setDraft = useBookingStore(
    (s: { setDraft: (d: BookingDraft) => void }) => s.setDraft
  );
  // Prefer backend services when available; map to local shape for display
  const services = useMemo(() => {
    if (apiServices && apiServices.length > 0) {
      return apiServices.map(s => ({
        id: String(s.id),
        name: s.name,
        duration: s.durationMinutes,
        price:
          Number.parseFloat(String(s.basePrice).replace(/[^0-9.]/g, '')) || 0,
        description: s.description,
      }));
    }
    return defaultServices;
  }, [apiServices]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<
    'service' | 'barber' | 'calendar'
  >('service');

  const handleServiceSelect = (serviceId: string) => {
    // Preselect using state manager (Zustand): set a minimal draft with serviceName only.
    const svc = services.find(s => s.id === serviceId);
    if (svc) {
      setDraft({
        serviceName: svc.name,
        barberId: 0,
        barberName: '',
        date: '',
        slotStart: '',
        durationMinutes: 0,
        price: '',
      });
    }
    router.push('/booking');
  };

  const handleBarberSelect = (barberId: string) => {
    setSelectedBarber(barberId);
    setShowCalendar(true);
    setCurrentStep('calendar');
  };

  const handleBooking = () => {
    const service = services.find(s => s.id === selectedService);
    const barber = barbers.find(b => b.id === selectedBarber);
    show({
      variant: 'success',
      title: 'Booking confirmed!',
      description: `Service: ${service?.name} • Barber: ${barber?.name} • ${selectedDate} at ${selectedTime}`,
    });

    // Reset state
    setSelectedService(null);
    setSelectedBarber(null);
    setShowCalendar(false);
    setSelectedDate(null);
    setSelectedTime(null);
    setCurrentStep('service');
  };

  const selectedBarberData = barbers.find(b => b.id === selectedBarber);
  const availableSlots =
    selectedBarberData?.availability[
      selectedDate as keyof typeof selectedBarberData.availability
    ] || [];

  return (
    <section id="booking" className="py-20 bg-background-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-6">
            Book Your Experience
          </h2>
          <p className="text-xl text-foreground-secondary leading-relaxed">
            Choose your service, select your preferred barber, and pick the
            perfect time slot.
          </p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {['service', 'barber', 'calendar'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep === step ||
                    index <
                      ['service', 'barber', 'calendar'].indexOf(currentStep)
                      ? 'bg-amber-400 text-[var(--color-gray-900)]'
                      : 'bg-background-secondary border border-border text-foreground-muted'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 2 && (
                  <div
                    className={`w-12 h-0.5 mx-2 transition-colors ${
                      index <
                      ['service', 'barber', 'calendar'].indexOf(currentStep)
                        ? 'bg-amber-400'
                        : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Service Selection */}
        {currentStep === 'service' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h3 className="text-2xl font-display font-bold text-foreground mb-8 text-center">
              Choose Your Service
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map(service => (
                <motion.div
                  key={service.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleServiceSelect(service.id)}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedService === service.id
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'hover:border-amber-400/50'
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl text-foreground">
                          {service.name}
                        </CardTitle>
                        <span className="text-2xl font-bold text-amber-400">
                          ${service.price}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground-secondary mb-3">
                        {service.description}
                      </p>
                      <div className="flex items-center text-sm text-foreground-muted">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.duration} minutes
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Barber Selection */}
        {currentStep === 'barber' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-display font-bold text-foreground">
                Choose Your Barber
              </h3>
              <Button
                variant="ghost"
                onClick={() => setCurrentStep('service')}
                className="text-foreground-secondary hover:text-foreground"
              >
                ← Back to Services
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {barbers.map(barber => (
                <motion.div
                  key={barber.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBarberSelect(barber.id)}
                  className="cursor-pointer"
                >
                  <Card
                    className={`transition-all duration-300 ${
                      selectedBarber === barber.id
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'hover:border-amber-400/50'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="aspect-square mb-4 relative rounded-xl overflow-hidden">
                        <Image
                          src={barber.image}
                          alt={barber.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-1">
                        {barber.name}
                      </h4>
                      <p className="text-sm text-amber-400 mb-2">
                        {barber.title}
                      </p>
                      <p className="text-xs text-foreground-muted mb-3">
                        {barber.experience}
                      </p>
                      <div className="flex items-center mb-3">
                        <Star className="h-4 w-4 text-amber-400 fill-current mr-1" />
                        <span className="text-sm font-medium text-foreground">
                          {barber.rating}
                        </span>
                        <span className="text-xs text-foreground-muted ml-1">
                          ({barber.reviews})
                        </span>
                      </div>
                      <div className="space-y-1">
                        {barber.specialties.slice(0, 2).map(specialty => (
                          <span
                            key={specialty}
                            className="inline-block text-xs bg-background-secondary px-2 py-1 rounded text-foreground-muted"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Calendar Modal */}
        <AnimatePresence>
          {showCalendar && selectedBarberData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowCalendar(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background border border-border rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                      Book with {selectedBarberData.name}
                    </h3>
                    <p className="text-foreground-secondary">
                      {services.find(s => s.id === selectedService)?.name} •{' '}
                      {services.find(s => s.id === selectedService)?.duration}{' '}
                      min • $
                      {services.find(s => s.id === selectedService)?.price}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCalendar(false)}
                    className="text-foreground-muted hover:text-foreground"
                    aria-label="Close calendar"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Available Dates */}
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-4">
                      Available Dates
                    </h4>
                    <div className="space-y-2">
                      {Object.keys(selectedBarberData.availability).map(
                        date => (
                          <Button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            variant="ghost"
                            className={`w-full justify-start text-left p-3 rounded-lg border transition-colors ${
                              selectedDate === date
                                ? 'border-amber-400 bg-amber-400/10 text-foreground'
                                : 'border-border bg-background-secondary/50 text-foreground-secondary hover:border-amber-400/50'
                            }`}
                          >
                            {new Date(date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </Button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Available Times */}
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-4">
                      {selectedDate ? 'Available Times' : 'Select a date first'}
                    </h4>
                    {selectedDate && (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.map((time: string) => (
                          <Button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            variant="ghost"
                            className={`p-3 text-center rounded-lg border transition-colors ${
                              selectedTime === time
                                ? 'border-amber-400 bg-amber-400/10 text-foreground'
                                : 'border-border bg-background-secondary/50 text-foreground-secondary hover:border-amber-400/50'
                            }`}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedDate && selectedTime && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-4 bg-amber-400/10 border border-amber-400/20 rounded-lg"
                  >
                    <h5 className="font-semibold text-foreground mb-2">
                      Booking Summary
                    </h5>
                    <div className="text-sm text-foreground-secondary space-y-1">
                      <p>
                        Service:{' '}
                        {services.find(s => s.id === selectedService)?.name}
                      </p>
                      <p>Barber: {selectedBarberData.name}</p>
                      <p>Date: {new Date(selectedDate).toLocaleDateString()}</p>
                      <p>Time: {selectedTime}</p>
                      <p className="font-semibold text-foreground">
                        Total: $
                        {services.find(s => s.id === selectedService)?.price}
                      </p>
                    </div>
                    <Button onClick={handleBooking} className="w-full mt-4">
                      Confirm Booking
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-background-secondary/50 backdrop-blur-sm border border-border rounded-2xl p-8">
              <h3 className="text-2xl font-display font-bold text-foreground mb-6">
                Quick Contact
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="text-foreground font-medium">
                      (555) 123-4567
                    </p>
                    <p className="text-foreground-muted text-sm">
                      Available 9 AM - 8 PM, 7 days a week
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="text-foreground font-medium">
                      123 Style Street
                    </p>
                    <p className="text-foreground-muted text-sm">
                      Downtown District, City 12345
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-400/10 to-amber-600/10 border border-amber-400/20 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Booking Policy
              </h3>
              <div className="space-y-2 text-foreground-secondary text-sm">
                <p>• 24-hour cancellation notice required</p>
                <p>• Late arrivals may result in shortened service</p>
                <p>• We recommend booking 1-2 weeks in advance</p>
                <p>• Walk-ins welcome based on availability</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
