'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Scissors, Phone, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserButton, SignInButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  readonly className?: string
}

export default function Header({ className }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Services', href: '#services' },
    { name: 'Team', href: '#team' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled 
          ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50' 
          : 'bg-transparent',
        className
      )}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-3"
          >
            <div className="relative">
              <Scissors className="h-8 w-8 text-amber-400 transform rotate-45" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full opacity-75 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">WizCuts</h1>
              <p className="text-xs text-slate-300 font-light tracking-wider">PREMIUM GROOMING</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-slate-200 hover:text-amber-400 transition-colors duration-300 font-medium tracking-wide relative group"
                onClick={() => {
                  document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
              </motion.a>
            ))}
          </div>

          {/* Contact Info & CTA */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="flex items-center space-x-4 text-sm text-slate-300">
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>Downtown</span>
              </div>
            </div>
            
            {/* Authentication Section */}
            {isLoaded && (
              <div className="flex items-center space-x-4">
                {isSignedIn ? (
                  <div className="flex items-center space-x-3">
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:shadow-amber-400/25 transition-all duration-300"
                      onClick={() => {
                        document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      Book Now
                    </motion.button>
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10 rounded-full border-2 border-amber-400/50 hover:border-amber-400 transition-colors",
                          userButtonPopoverCard: "bg-slate-800 border border-slate-600 shadow-2xl",
                          userButtonPopoverActionButton: "text-slate-200 hover:bg-slate-700 hover:text-amber-400 transition-colors",
                          userButtonPopoverActionButtonText: "text-slate-200",
                          userButtonPopoverActionButtonIcon: "text-slate-400",
                          userButtonPopoverFooter: "hidden", // Hide the footer
                        }
                      }}
                      userProfileMode="navigation"
                      userProfileUrl="/profile"
                    />
                  </div>
                ) : (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:shadow-amber-400/25 transition-all duration-300"
                      onClick={() => router.push('/sign-in')}
                    >
                      Sign In
                    </motion.button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:hidden text-white hover:text-amber-400 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-700/50 mt-4 pt-4 pb-6"
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-slate-200 hover:text-amber-400 transition-colors duration-300 font-medium py-2"
                  onClick={() => {
                    setIsOpen(false)
                    document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  {item.name}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-4 border-t border-slate-700/50"
              >
                <div className="text-sm text-slate-300 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="h-4 w-4" />
                    <span>(555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>123 Style Street, Downtown</span>
                  </div>
                </div>
                
                {/* Mobile Authentication */}
                {isLoaded && (
                  <div className="space-y-3">
                    {isSignedIn ? (
                      <>
                        <button
                          className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 px-6 py-3 rounded-full font-semibold"
                          onClick={() => {
                            setIsOpen(false)
                            document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' })
                          }}
                        >
                          Book Your Appointment
                        </button>
                        <div className="flex items-center justify-center pt-2">
                          <UserButton 
                            appearance={{
                              elements: {
                                avatarBox: "w-10 h-10 rounded-full border-2 border-amber-400/50",
                                userButtonPopoverCard: "bg-slate-800 border border-slate-600",
                                userButtonPopoverActionButton: "text-slate-200 hover:bg-slate-700 hover:text-amber-400",
                              }
                            }}
                            userProfileMode="navigation"
                            userProfileUrl="/profile"
                          />
                        </div>
                      </>
                    ) : (
                      <SignInButton mode="modal">
                        <button className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 px-6 py-3 rounded-full font-semibold">
                          Sign In to Book
                        </button>
                      </SignInButton>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  )
}
