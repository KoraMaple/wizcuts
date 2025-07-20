/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { BarberService } from '../../src/services/barber-drizzle.service';
import { BookingService } from '../../src/services/booking.service';
import { BarberController } from '../../src/controllers/barber.controller';
import { BookingController } from '../../src/controllers/booking.controller';
import { ClerkAuthGuard } from '../../src/guards/clerk-auth.guard';

// Mock Clerk SDK before any imports that use it
jest.mock('@clerk/clerk-sdk-node', () => ({
  clerkClient: {
    verifyToken: jest.fn(),
    users: {
      getUser: jest.fn(),
    },
  },
}));

// Mock the database module
jest.mock('../../src/database/database', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock Clerk verification
jest.mock('@clerk/backend', () => ({
  verifyToken: jest.fn(),
}));

describe('API Integration Tests', () => {
  let app: INestApplication;
  let barberService: BarberService;
  let bookingService: BookingService;

  const mockBarber = {
    id: 1,
    name: 'John Doe',
    title: 'Master Barber',
    bio: 'Experienced barber',
    image: '/images/barber1.jpg',
    experienceYears: 10,
    specialties: ['Classic Cuts'],
    rating: '4.5',
    reviewCount: 25,
    isActive: true,
    phone: '+1234567890',
    email: 'john@wizcuts.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  // Expected response format (JSON serialized)
  const expectedBarberResponse = {
    id: 1,
    name: 'John Doe',
    title: 'Master Barber',
    bio: 'Experienced barber',
    image: '/images/barber1.jpg',
    experienceYears: 10,
    specialties: ['Classic Cuts'],
    rating: '4.5',
    reviewCount: 25,
    isActive: true,
    phone: '+1234567890',
    email: 'john@wizcuts.com',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockBooking = {
    id: 1,
    barberId: 1,
    customerName: 'John Customer',
    customerEmail: 'john@customer.com',
    customerPhone: '+1234567890',
    serviceName: 'Classic Haircut',
    totalPrice: '25.00',
    appointmentDateTime: new Date('2024-02-15T10:00:00Z'),
    durationMinutes: 60,
    status: 'confirmed',
    notes: 'Regular customer',
    clerkUserId: 'user_123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      controllers: [BarberController, BookingController],
      providers: [
        BarberService,
        BookingService,
        ClerkAuthGuard,
        {
          provide: 'Reflector',
          useValue: {
            getAllAndOverride: jest.fn().mockReturnValue(true), // Mark all routes as public for testing
          },
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true), // Allow all requests
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    barberService = moduleFixture.get<BarberService>(BarberService);
    bookingService = moduleFixture.get<BookingService>(BookingService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('/barbers (GET)', () => {
    it('should return all barbers', async () => {
      // Arrange
      jest.spyOn(barberService, 'findAll').mockResolvedValue([mockBarber]);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/barbers')
        .expect(200);

      expect(response.body).toEqual([expectedBarberResponse]);
      expect(barberService.findAll).toHaveBeenCalled();
    });

    it('should handle empty barbers list', async () => {
      // Arrange
      jest.spyOn(barberService, 'findAll').mockResolvedValue([]);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/barbers')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should handle service errors', async () => {
      // Arrange
      jest
        .spyOn(barberService, 'findAll')
        .mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await request(app.getHttpServer()).get('/barbers').expect(500);
    });
  });

  describe('/barbers/:id (GET)', () => {
    it('should return a specific barber', async () => {
      // Arrange
      jest.spyOn(barberService, 'findOne').mockResolvedValue(mockBarber);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/barbers/1')
        .expect(200);

      expect(response.body).toEqual(mockBarber);
      expect(barberService.findOne).toHaveBeenCalledWith(1);
    });

    it('should return 404 for non-existent barber', async () => {
      // Arrange
      jest
        .spyOn(barberService, 'findOne')
        .mockRejectedValue(new Error('Barber with ID 999 not found'));

      // Act & Assert
      await request(app.getHttpServer()).get('/barbers/999').expect(500); // Note: In real app, this would be 404 with proper exception filters
    });

    it('should handle invalid ID parameter', async () => {
      // Act & Assert
      await request(app.getHttpServer()).get('/barbers/invalid').expect(400);
    });
  });

  describe('/barbers (POST)', () => {
    const createBarberDto = {
      name: 'Jane Doe',
      title: 'Senior Barber',
      bio: 'Skilled barber with 5+ years experience',
      image: '/images/barber2.jpg',
      experienceYears: 5,
      specialties: ['Modern Cuts', 'Color'],
      phone: '+1987654321',
      email: 'jane@wizcuts.com',
    };

    it('should create a new barber', async () => {
      // Arrange
      const createdBarber = { ...mockBarber, ...createBarberDto, id: 2 };
      jest.spyOn(barberService, 'create').mockResolvedValue(createdBarber);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/barbers')
        .send(createBarberDto)
        .expect(201);

      expect(response.body).toEqual(createdBarber);
      expect(barberService.create).toHaveBeenCalledWith(createBarberDto);
    });

    it('should validate required fields', async () => {
      // Act & Assert
      await request(app.getHttpServer()).post('/barbers').send({}).expect(400);
    });

    it('should validate email format', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/barbers')
        .send({ ...createBarberDto, email: 'invalid-email' })
        .expect(400);
    });

    it('should handle duplicate email errors', async () => {
      // Arrange
      jest
        .spyOn(barberService, 'create')
        .mockRejectedValue(new Error('Email already exists'));

      // Act & Assert
      await request(app.getHttpServer())
        .post('/barbers')
        .send(createBarberDto)
        .expect(500);
    });
  });

  describe('/barbers/:id (PATCH)', () => {
    const updateBarberDto = {
      name: 'John Smith',
      rating: '4.8', // Change to string to match schema
    };

    it('should update a barber', async () => {
      // Arrange
      const updatedBarber = { ...mockBarber, ...updateBarberDto };
      jest.spyOn(barberService, 'update').mockResolvedValue(updatedBarber);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch('/barbers/1')
        .send(updateBarberDto)
        .expect(200);

      expect(response.body).toEqual(updatedBarber);
      expect(barberService.update).toHaveBeenCalledWith(1, updateBarberDto);
    });

    it('should handle partial updates', async () => {
      // Arrange
      const partialUpdate = { name: 'Updated Name' };
      const updatedBarber = { ...mockBarber, name: 'Updated Name' };
      jest.spyOn(barberService, 'update').mockResolvedValue(updatedBarber);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch('/barbers/1')
        .send(partialUpdate)
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
    });
  });

  describe('/barbers/:id (DELETE)', () => {
    it('should delete a barber', async () => {
      // Arrange
      jest.spyOn(barberService, 'remove').mockResolvedValue();

      // Act & Assert
      const response = await request(app.getHttpServer())
        .delete('/barbers/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Barber deleted successfully' });
      expect(barberService.remove).toHaveBeenCalledWith(1);
    });

    it('should handle non-existent barber deletion', async () => {
      // Arrange
      jest
        .spyOn(barberService, 'remove')
        .mockRejectedValue(new Error('Barber with ID 999 not found'));

      // Act & Assert
      await request(app.getHttpServer()).delete('/barbers/999').expect(500);
    });
  });

  describe('/bookings (GET)', () => {
    it('should return all bookings', async () => {
      // Arrange
      jest.spyOn(bookingService, 'findAll').mockResolvedValue([mockBooking]);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/bookings')
        .expect(200);

      expect(response.body).toEqual([mockBooking]);
      expect(bookingService.findAll).toHaveBeenCalled();
    });

    it('should filter bookings by barber ID', async () => {
      // Arrange
      jest.spyOn(bookingService, 'findAll').mockResolvedValue([mockBooking]);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/bookings?barberId=1')
        .expect(200);

      expect(response.body).toEqual([mockBooking]);
      expect(bookingService.findAll).toHaveBeenCalledWith({ barberId: 1 });
    });

    it('should filter bookings by status', async () => {
      // Arrange
      jest.spyOn(bookingService, 'findAll').mockResolvedValue([mockBooking]);

      // Act & Assert
      await request(app.getHttpServer())
        .get('/bookings?status=confirmed')
        .expect(200);

      expect(bookingService.findAll).toHaveBeenCalledWith({
        status: 'confirmed',
      });
    });

    it('should filter bookings by date range', async () => {
      // Arrange
      jest.spyOn(bookingService, 'findAll').mockResolvedValue([mockBooking]);

      // Act & Assert
      await request(app.getHttpServer())
        .get('/bookings?startDate=2024-01-01&endDate=2024-12-31')
        .expect(200);

      expect(bookingService.findAll).toHaveBeenCalledWith({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });
    });
  });

  describe('/bookings (POST)', () => {
    const createBookingDto = {
      barberId: 1,
      customerName: 'Jane Customer',
      customerEmail: 'jane@customer.com',
      customerPhone: '+1987654321',
      serviceName: 'Premium Cut',
      totalPrice: '45.00', // Change to string to match schema
      appointmentDateTime: '2024-03-15T14:00:00Z',
      durationMinutes: 90,
      notes: 'First-time customer',
    };

    it('should create a new booking', async () => {
      // Arrange
      const createdBooking = {
        ...mockBooking,
        ...createBookingDto,
        id: 2,
        appointmentDateTime: new Date(createBookingDto.appointmentDateTime),
      };
      jest.spyOn(bookingService, 'create').mockResolvedValue(createdBooking);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/bookings')
        .send(createBookingDto)
        .expect(201);

      expect(response.body).toEqual(createdBooking);
      expect(bookingService.create).toHaveBeenCalledWith(createBookingDto);
    });

    it('should validate required booking fields', async () => {
      // Act & Assert
      await request(app.getHttpServer()).post('/bookings').send({}).expect(400);
    });

    it('should validate email format in booking', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/bookings')
        .send({ ...createBookingDto, customerEmail: 'invalid-email' })
        .expect(400);
    });

    it('should handle booking conflicts', async () => {
      // Arrange
      jest
        .spyOn(bookingService, 'create')
        .mockRejectedValue(new Error('Time slot is already booked'));

      // Act & Assert
      await request(app.getHttpServer())
        .post('/bookings')
        .send(createBookingDto)
        .expect(500);
    });
  });

  describe('/bookings/:id (PATCH)', () => {
    it('should update a booking', async () => {
      // Arrange
      const updateBookingDto = {
        status: 'completed',
        notes: 'Service completed successfully',
      };
      const updatedBooking = { ...mockBooking, ...updateBookingDto };
      jest.spyOn(bookingService, 'update').mockResolvedValue(updatedBooking);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch('/bookings/1')
        .send(updateBookingDto)
        .expect(200);

      expect(response.body).toEqual(updatedBooking);
      expect(bookingService.update).toHaveBeenCalledWith(1, updateBookingDto);
    });
  });

  describe('/bookings/:id (DELETE)', () => {
    it('should delete a booking', async () => {
      // Arrange
      jest.spyOn(bookingService, 'remove').mockResolvedValue();

      // Act & Assert
      const response = await request(app.getHttpServer())
        .delete('/bookings/1')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Booking deleted successfully',
      });
      expect(bookingService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON requests', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/barbers')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    it('should handle large payloads', async () => {
      // Arrange
      const largePayload = {
        name: 'A'.repeat(10000),
        title: 'B'.repeat(10000),
        bio: 'C'.repeat(50000),
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/barbers')
        .send(largePayload)
        .expect(400);
    });

    it('should handle concurrent requests', async () => {
      // Arrange
      jest.spyOn(barberService, 'findAll').mockResolvedValue([mockBarber]);

      // Act
      const requests = Array(10)
        .fill(null)
        .map(() => request(app.getHttpServer()).get('/barbers'));

      const responses = await Promise.all(requests);

      // Assert
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual([mockBarber]);
      });
      expect(barberService.findAll).toHaveBeenCalledTimes(10);
    });
  });

  describe('Content negotiation', () => {
    it('should return JSON by default', async () => {
      // Arrange
      jest.spyOn(barberService, 'findAll').mockResolvedValue([mockBarber]);

      // Act & Assert
      await request(app.getHttpServer())
        .get('/barbers')
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('should handle Accept header', async () => {
      // Arrange
      jest.spyOn(barberService, 'findAll').mockResolvedValue([mockBarber]);

      // Act & Assert
      await request(app.getHttpServer())
        .get('/barbers')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/);
    });
  });
});
