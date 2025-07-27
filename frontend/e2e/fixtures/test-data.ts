/**
 * Test data fixtures for E2E tests
 */

export const testData = {
  // User data for booking tests
  customers: {
    validCustomer: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
    },
    anotherCustomer: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+0987654321',
    },
    invalidCustomer: {
      name: '',
      email: 'invalid-email',
      phone: 'not-a-phone',
    },
  },

  // Barber service data
  services: {
    haircut: {
      name: 'Classic Haircut',
      duration: 30,
      price: 35,
    },
    shave: {
      name: 'Traditional Shave',
      duration: 45,
      price: 25,
    },
    beardTrim: {
      name: 'Beard Trim',
      duration: 20,
      price: 20,
    },
  },

  // Barber data
  barbers: {
    mainBarber: {
      name: 'Mike Johnson',
      specialties: ['Haircuts', 'Beard Styling'],
      experience: '5 years',
    },
    seniorBarber: {
      name: 'Tony Rodriguez',
      specialties: ['Classic Cuts', 'Shaves'],
      experience: '10 years',
    },
  },

  // Booking time slots
  timeSlots: {
    morning: '09:00',
    afternoon: '14:00',
    evening: '17:30',
  },

  // Common UI text that might appear
  uiText: {
    bookingConfirmation: 'Your appointment has been confirmed',
    validationErrors: {
      nameRequired: 'Name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email address',
      phoneInvalid: 'Please enter a valid phone number',
    },
    navigationLinks: {
      home: 'Home',
      services: 'Services',
      booking: 'Book Appointment',
      about: 'About',
      contact: 'Contact',
    },
  },

  // Common selectors that might be used across tests
  selectors: {
    navigation: {
      header: 'header, [role="banner"]',
      mainNav: 'nav, [role="navigation"]',
      mobileMenu: '[data-testid="mobile-menu"], .mobile-menu',
    },
    booking: {
      form: 'form[data-testid="booking-form"], form.booking-form',
      nameField: 'input[name="name"], input[name="customerName"]',
      emailField: 'input[name="email"], input[type="email"]',
      phoneField: 'input[name="phone"], input[type="tel"]',
      submitButton: 'button[type="submit"], [data-testid="submit"]',
      confirmationMessage: '.confirmation, [data-testid="confirmation"]',
    },
    common: {
      loadingSpinner: '.loading, .spinner, [data-testid="loading"]',
      errorMessage: '.error, [data-testid="error"]',
      successMessage: '.success, [data-testid="success"]',
      modal: '.modal, [role="dialog"]',
      closeButton: '[aria-label="Close"], .close',
    },
  },

  // API endpoints that might be used for mocking
  apiEndpoints: {
    bookings: '/api/bookings',
    barbers: '/api/barbers',
    services: '/api/services',
    availability: '/api/availability',
  },

  // Mock API responses
  mockResponses: {
    barbers: [
      {
        id: 1,
        name: 'Mike Johnson',
        specialties: ['Haircuts', 'Beard Styling'],
        available: true,
      },
      {
        id: 2,
        name: 'Tony Rodriguez',
        specialties: ['Classic Cuts', 'Shaves'],
        available: true,
      },
    ],
    services: [
      {
        id: 1,
        name: 'Classic Haircut',
        duration: 30,
        price: 35,
        description: 'Professional haircut styled to your preference',
      },
      {
        id: 2,
        name: 'Traditional Shave',
        duration: 45,
        price: 25,
        description: 'Hot towel shave with premium products',
      },
    ],
    availability: {
      '2024-01-15': ['09:00', '10:30', '14:00', '15:30', '17:00'],
      '2024-01-16': ['09:00', '11:00', '14:30', '16:00'],
      '2024-01-17': ['10:00', '13:00', '15:00', '17:30'],
    },
    bookingSuccess: {
      id: 123,
      customerName: 'John Doe',
      email: 'john.doe@example.com',
      service: 'Classic Haircut',
      barber: 'Mike Johnson',
      dateTime: '2024-01-15T09:00:00Z',
      status: 'confirmed',
    },
  },

  // Common viewport sizes for responsive testing
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
    largeDesktop: { width: 1920, height: 1080 },
  },
};

export default testData;
