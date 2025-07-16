'use client'

import { motion } from 'framer-motion'
import { Scissors, Phone, Mail, MapPin, Camera, Users, MessageCircle, Clock } from 'lucide-react'

export default function Footer() {
  const socialLinks = [
    { icon: Camera, href: 'https://instagram.com/wizcuts', label: 'Instagram' },
    { icon: Users, href: 'https://facebook.com/wizcuts', label: 'Facebook' },
    { icon: MessageCircle, href: 'https://twitter.com/wizcuts', label: 'Twitter' }
  ]

  const quickLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Book Now', href: '#booking' },
    { name: 'Contact', href: '#contact' }
  ]

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <Scissors className="h-8 w-8 text-amber-400 transform rotate-45" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full opacity-75 animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white">WizCuts</h3>
                <p className="text-xs text-slate-300 font-light tracking-wider">PREMIUM GROOMING</p>
              </div>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-md">
              Crafting confidence through the art of sophisticated grooming. Where tradition meets innovation in every cut.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-br hover:from-amber-400 hover:to-amber-600 rounded-full flex items-center justify-center text-slate-300 hover:text-slate-900 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-300 hover:text-amber-400 transition-colors duration-300 flex items-center group"
                    onClick={(e) => {
                      e.preventDefault()
                      document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-amber-400 transition-all duration-300 mr-0 group-hover:mr-3"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold text-white mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-300">123 Style Street</p>
                  <p className="text-slate-300">Downtown District</p>
                  <p className="text-slate-300">City, State 12345</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-amber-400 flex-shrink-0" />
                <a href="tel:+15551234567" className="text-slate-300 hover:text-amber-400 transition-colors">
                  (555) 123-4567
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-amber-400 flex-shrink-0" />
                <a href="mailto:info@wizcuts.com" className="text-slate-300 hover:text-amber-400 transition-colors">
                  info@wizcuts.com
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-slate-300">
                  <p>Mon-Fri: 9 AM - 8 PM</p>
                  <p>Sat: 8 AM - 7 PM</p>
                  <p>Sun: 10 AM - 6 PM</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="border-t border-slate-800 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-400 text-sm">
              © 2025 WizCuts. All rights reserved. Crafted with precision and style.
            </p>
            <div className="flex space-x-6 text-sm">
              <button 
                className="text-slate-400 hover:text-amber-400 transition-colors"
                onClick={() => alert('Privacy Policy coming soon')}
              >
                Privacy Policy
              </button>
              <button 
                className="text-slate-400 hover:text-amber-400 transition-colors"
                onClick={() => alert('Terms of Service coming soon')}
              >
                Terms of Service
              </button>
              <button 
                className="text-slate-400 hover:text-amber-400 transition-colors"
                onClick={() => alert('Accessibility information coming soon')}
              >
                Accessibility
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
