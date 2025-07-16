'use client'

import { motion } from 'framer-motion'
import { Scissors, Zap, Palette, Crown, Clock, Shield } from 'lucide-react'

const services = [
  {
    icon: Scissors,
    title: 'Signature Cuts',
    description: 'Precision haircuts tailored to your face shape and personal style',
    price: 'From $85',
    features: ['Consultation', 'Wash & Style', 'Finishing Products'],
    color: 'from-amber-400 to-amber-600'
  },
  {
    icon: Zap,
    title: 'Traditional Shaves',
    description: 'Classic hot towel shaves with premium oils and aftercare',
    price: 'From $65',
    features: ['Hot Towel', 'Premium Oils', 'Aftercare Treatment'],
    color: 'from-blue-400 to-blue-600'
  },
  {
    icon: Palette,
    title: 'Color & Styling',
    description: 'Expert color consultation and professional styling services',
    price: 'From $120',
    features: ['Color Analysis', 'Professional Products', 'Style Consultation'],
    color: 'from-purple-400 to-purple-600'
  },
  {
    icon: Crown,
    title: 'VIP Experience',
    description: 'Complete grooming package with luxury amenities',
    price: 'From $200',
    features: ['Full Service', 'Luxury Products', 'Complimentary Beverages'],
    color: 'from-gold-400 to-gold-600'
  }
]

const benefits = [
  {
    icon: Clock,
    title: 'Time Respect',
    description: 'Punctual service with minimal wait times'
  },
  {
    icon: Shield,
    title: 'Premium Quality',
    description: 'Only the finest products and tools'
  }
]

export default function Services() {
  return (
    <section id="services" className="py-20 bg-slate-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
            Our Services
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed">
            Discover our range of premium grooming services, each designed to elevate your personal style and confidence.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/50 transition-all duration-300"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-display font-bold text-white group-hover:text-amber-400 transition-colors duration-300">
                      {service.title}
                    </h3>
                    <span className="text-xl font-semibold text-amber-400">
                      {service.price}
                    </span>
                  </div>
                  <p className="text-slate-300 text-lg leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span className="text-slate-300 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-8 w-full bg-slate-700/50 hover:bg-slate-600/50 text-white py-3 rounded-full font-semibold transition-all duration-300 border border-slate-600/50 hover:border-amber-400/50"
                  onClick={() => {
                    document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Book This Service
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-display font-bold text-white mb-8 text-center">
            Why Choose WizCuts?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="flex items-center space-x-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">{benefit.title}</h4>
                  <p className="text-slate-300">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
