'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Phone, Mail, MessageSquare } from 'lucide-react'

const services = ['Signature Cut', 'Traditional Shave', 'Color & Styling', 'VIP Experience']
const timeSlots = ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM', '6:00 PM']

export default function Booking() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Here you would normally send the data to your backend
    console.log('Booking submitted:', formData)
    
    setIsSubmitting(false)
    // Reset form or show success message
    alert('Your booking request has been submitted! We\'ll contact you shortly to confirm.')
    setFormData({
      name: '',
      email: '',
      phone: '',
      service: '',
      date: '',
      time: '',
      message: ''
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section id="booking" className="py-20 bg-slate-800/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
            Book Your Experience
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed">
            Reserve your chair and let our master barbers craft your perfect look. Book online or call us directly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-display font-bold text-white mb-8">Schedule Your Appointment</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 font-medium mb-2" htmlFor="name">
                    <User className="inline h-4 w-4 mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-amber-400 focus:outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2" htmlFor="phone">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-amber-400 focus:outline-none transition-colors"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2" htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-amber-400 focus:outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-slate-300 font-medium mb-2" htmlFor="service">
                  Service
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:border-amber-400 focus:outline-none transition-colors"
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 font-medium mb-2" htmlFor="date">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2" htmlFor="time">
                    <Clock className="inline h-4 w-4 mr-2" />
                    Preferred Time
                  </label>
                  <select
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:border-amber-400 focus:outline-none transition-colors"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-slate-300 font-medium mb-2" htmlFor="message">
                  <MessageSquare className="inline h-4 w-4 mr-2" />
                  Special Requests (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-amber-400 focus:outline-none transition-colors"
                  placeholder="Any specific requests or preferences..."
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 py-4 rounded-lg font-semibold text-lg hover:shadow-xl hover:shadow-amber-400/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Book Appointment'}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Quick Contact */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
              <h3 className="text-2xl font-display font-bold text-white mb-6">Quick Contact</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-amber-400 mb-2">Call or Text</h4>
                  <p className="text-slate-300 text-lg">(555) 123-4567</p>
                  <p className="text-slate-400 text-sm">Available 9 AM - 8 PM, 7 days a week</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-amber-400 mb-2">Location</h4>
                  <p className="text-slate-300">123 Style Street</p>
                  <p className="text-slate-300">Downtown District</p>
                  <p className="text-slate-300">City, State 12345</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-amber-400 mb-2">Hours</h4>
                  <div className="space-y-1 text-slate-300">
                    <p>Monday - Friday: 9 AM - 8 PM</p>
                    <p>Saturday: 8 AM - 7 PM</p>
                    <p>Sunday: 10 AM - 6 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-br from-amber-400/10 to-amber-600/10 border border-amber-400/20 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-4">Booking Policy</h3>
              <div className="space-y-3 text-slate-300">
                <p>• 24-hour cancellation notice required</p>
                <p>• Late arrivals may result in shortened service</p>
                <p>• We recommend booking 1-2 weeks in advance</p>
                <p>• Walk-ins welcome based on availability</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
