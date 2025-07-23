'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaCalendarAlt, FaClock, FaUser, FaCut, FaArrowRight } from 'react-icons/fa'

interface BookingData {
  service: string
  barber: string
  date: string
  time: string
}

const services = [
  { name: 'Premium Cut & Style', price: '$85', duration: '45 min' },
  { name: 'Classic Cut', price: '$65', duration: '30 min' },
  { name: 'Beard Trim & Style', price: '$45', duration: '30 min' },
  { name: 'Full Service Package', price: '$120', duration: '60 min' },
]

const barbers = [
  { name: 'Michael Rodriguez', specialty: 'Classic & Modern Styles' },
  { name: 'James Wilson', specialty: 'Precision Cuts & Beard Work' },
  { name: 'Alexander Thompson', specialty: 'Creative Styling & Color' },
]

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
]

export default function BookingPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingData>({
    service: '',
    barber: '',
    date: '',
    time: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields are selected
    if (!bookingData.service || !bookingData.barber || !bookingData.date || !bookingData.time) {
      alert('Please select all booking details')
      return
    }

    // Get selected service details
    const selectedService = services.find(s => s.name === bookingData.service)
    
    // Redirect to confirmation page with booking data
    const params = new URLSearchParams({
      service: bookingData.service,
      barber: bookingData.barber,
      date: bookingData.date,
      time: bookingData.time,
      duration: selectedService?.duration || '45 min',
      price: selectedService?.price || '$85'
    })
    
    router.push(`/booking/confirm?${params.toString()}`)
  }

  // Generate next 30 days for date selection
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      // Skip Sundays (day 0)
      if (date.getDay() !== 0) {
        dates.push(date.toISOString().split('T')[0])
      }
    }
    
    return dates
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-cream mb-2">Book Your Appointment</h1>
          <p className="text-slate-300">Select your preferred service, barber, and time</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Selection */}
          <div className="bg-charcoal/50 backdrop-blur-sm border border-slate-600/20 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-cream mb-6 flex items-center gap-2">
              <FaCut className="text-gold" />
              Select Service
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div
                  key={service.name}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    bookingData.service === service.name
                      ? 'border-gold bg-gold/10'
                      : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
                  }`}
                  onClick={() => setBookingData(prev => ({ ...prev, service: service.name }))}
                >
                  <h3 className="text-cream font-semibold mb-2">{service.name}</h3>
                  <div className="flex justify-between text-slate-300">
                    <span>{service.duration}</span>
                    <span className="text-gold font-bold">{service.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Barber Selection */}
          <div className="bg-charcoal/50 backdrop-blur-sm border border-slate-600/20 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-cream mb-6 flex items-center gap-2">
              <FaUser className="text-gold" />
              Choose Your Barber
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {barbers.map((barber) => (
                <div
                  key={barber.name}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    bookingData.barber === barber.name
                      ? 'border-gold bg-gold/10'
                      : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
                  }`}
                  onClick={() => setBookingData(prev => ({ ...prev, barber: barber.name }))}
                >
                  <h3 className="text-cream font-semibold mb-2">{barber.name}</h3>
                  <p className="text-slate-300 text-sm">{barber.specialty}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Date & Time Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div className="bg-charcoal/50 backdrop-blur-sm border border-slate-600/20 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-semibold text-cream mb-6 flex items-center gap-2">
                <FaCalendarAlt className="text-gold" />
                Select Date
              </h2>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {getAvailableDates().map((date) => {
                  const dateObj = new Date(date)
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                  const dayNum = dateObj.getDate()
                  const month = dateObj.toLocaleDateString('en-US', { month: 'short' })
                  
                  return (
                    <div
                      key={date}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] text-center ${
                        bookingData.date === date
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-slate-600 bg-slate-800/30 text-slate-300 hover:border-slate-500'
                      }`}
                      onClick={() => setBookingData(prev => ({ ...prev, date }))}
                    >
                      <div className="text-sm">{dayName}</div>
                      <div className="text-lg font-semibold">{dayNum}</div>
                      <div className="text-xs">{month}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Time Selection */}
            <div className="bg-charcoal/50 backdrop-blur-sm border border-slate-600/20 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-semibold text-cream mb-6 flex items-center gap-2">
                <FaClock className="text-gold" />
                Select Time
              </h2>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] text-center ${
                      bookingData.time === time
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-slate-600 bg-slate-800/30 text-slate-300 hover:border-slate-500'
                    }`}
                    onClick={() => setBookingData(prev => ({ ...prev, time }))}
                  >
                    {time}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-gold hover:bg-gold/90 text-charcoal font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg flex items-center gap-2 mx-auto"
            >
              Continue to Confirmation
              <FaArrowRight />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
