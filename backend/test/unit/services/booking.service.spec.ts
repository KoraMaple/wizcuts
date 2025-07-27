/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BookingService } from '../../../src/services/booking.service';
import { RealtimeService } from '../../../src/services/realtime.service';
import { db } from '../../../src/database/database';
import { BookingStatus } from '../../../src/schema';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingQueryDto,
} from '../../../src/dto/booking.dto';

// Mock the entire schema module to avoid relations issues
jest.mock('../../../src/schema', () => ({
  BookingStatus: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show',
  },
  bookings: {
    id: 'bookings.id',
    barberId: 'bookings.barberId',
    appointmentDateTime: 'bookings.appointmentDateTime',
  },
  barbers: {
    id: 'barbers.id',
    name: 'barbers.name',
  },
  barbersRelations: {},
  bookingsRelations: {},
}));

// Import mocked values for use in tests - using any to avoid type errors in tests

const mockSchema = jest.requireMock('../../../src/schema');
const { bookings, barbers } = mockSchema;

// Mock the database module
jest.mock('../../../src/database/database', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock Drizzle ORM functions
jest.mock('drizzle-orm', () => ({
  eq: jest.fn((field, value) => ({ field, value, type: 'eq' })),
  and: jest.fn((...conditions) => ({ conditions, type: 'and' })),
  or: jest.fn((...conditions) => ({ conditions, type: 'or' })),
  gte: jest.fn((field, value) => ({ field, value, type: 'gte' })),
  lte: jest.fn((field, value) => ({ field, value, type: 'lte' })),
}));

const mockDb = db as jest.Mocked<typeof db>;

describe('BookingService', () => {
  let service: BookingService;

  const mockAuthUser = {
    id: 'user_123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockBarber = {
    id: 1,
    name: 'John Barber',
    title: 'Master Barber',
    bio: 'Expert barber',
    image: '/images/barber1.jpg',
    experienceYears: 5,
    specialties: ['Classic Cuts'],
    rating: '4.5',
    reviewCount: 10,
    isActive: true,
    phone: '+1234567890',
    email: 'barber@wizcuts.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockBooking = {
    id: 1,
    barberId: 1,
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '+1987654321',
    serviceName: 'Classic Cut',
    totalPrice: '25.00',
    durationMinutes: 30,
    appointmentDateTime: new Date('2024-02-15T10:00:00Z'),
    status: BookingStatus.PENDING,
    notes: 'First time customer',
    clerkUserId: 'user_123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockCreateBookingDto: CreateBookingDto = {
    barberId: 1,
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '+1987654321',
    serviceName: 'Classic Cut',
    totalPrice: '25.0',
    durationMinutes: 30,
    appointmentDateTime: '2024-02-15T10:00:00Z',
    notes: 'First time customer',
  };

  const mockUpdateBookingDto: UpdateBookingDto = {
    status: BookingStatus.CONFIRMED,
    notes: 'Updated notes',
  };

  const mockBookingQueryDto: BookingQueryDto = {
    barberId: 1,
    status: BookingStatus.CONFIRMED,
    startDate: '2024-02-01',
    endDate: '2024-02-28',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: RealtimeService,
          useValue: {
            broadcastEvent: jest.fn(),
            subscribeToBookings: jest.fn(),
            subscribeToBarbers: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new booking successfully', async () => {
      // Arrange
      const mockBarberSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockBarber]),
      };
      const mockConflictSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      const mockInsertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockBooking]),
      };

      mockDb.select
        .mockReturnValueOnce(mockBarberSelectChain as any) // First call for barber check
        .mockReturnValueOnce(mockConflictSelectChain as any); // Second call for conflict check
      mockDb.insert.mockReturnValue(mockInsertChain as any);

      // Act
      const result = await service.create(mockCreateBookingDto, mockAuthUser);

      // Assert
      expect(mockDb.select).toHaveBeenCalledTimes(2);
      expect(mockBarberSelectChain.from).toHaveBeenCalledWith(barbers);
      expect(mockConflictSelectChain.from).toHaveBeenCalledWith(bookings);
      expect(mockDb.insert).toHaveBeenCalledWith(bookings);
      expect(mockInsertChain.values).toHaveBeenCalledWith({
        ...mockCreateBookingDto,
        totalPrice: '25.0', // Converted to string
        appointmentDateTime: new Date('2024-02-15T10:00:00Z'),
        clerkUserId: 'user_123',
        status: BookingStatus.PENDING,
      });
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException when barber does not exist', async () => {
      // Arrange
      const mockBarberSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(mockBarberSelectChain as any);

      // Act & Assert
      await expect(
        service.create(mockCreateBookingDto, mockAuthUser)
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create(mockCreateBookingDto, mockAuthUser)
      ).rejects.toThrow('Barber with ID 1 not found');
    });

    it('should throw BadRequestException when time slot is already booked', async () => {
      // Arrange
      const conflictingBooking = {
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      };
      const mockBarberSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockBarber]),
      };
      const mockConflictSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([conflictingBooking]),
      };

      mockDb.select
        .mockReturnValueOnce(mockBarberSelectChain as any)
        .mockReturnValueOnce(mockConflictSelectChain as any);

      // Act & Assert
      await expect(
        service.create(mockCreateBookingDto, mockAuthUser)
      ).rejects.toThrow('Time slot is already booked');
    });

    it('should create booking without user (guest booking)', async () => {
      // Arrange
      const mockBarberSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockBarber]),
      };
      const mockConflictSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      const mockInsertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest
          .fn()
          .mockResolvedValue([{ ...mockBooking, clerkUserId: null }]),
      };

      mockDb.select
        .mockReturnValueOnce(mockBarberSelectChain as any)
        .mockReturnValueOnce(mockConflictSelectChain as any);
      mockDb.insert.mockReturnValue(mockInsertChain as any);

      // Act
      const result = await service.create(mockCreateBookingDto);

      // Assert
      expect(mockInsertChain.values).toHaveBeenCalledWith({
        ...mockCreateBookingDto,
        totalPrice: '25.0',
        appointmentDateTime: new Date('2024-02-15T10:00:00Z'),
        clerkUserId: null,
        status: BookingStatus.PENDING,
      });
      expect(result.clerkUserId).toBeNull();
    });

    it('should handle totalPrice conversion correctly', async () => {
      // Arrange
      const expensiveBookingDto = {
        ...mockCreateBookingDto,
        totalPrice: '123.45',
      };
      const mockBarberSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockBarber]),
      };
      const mockConflictSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      const mockInsertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockBooking]),
      };

      mockDb.select
        .mockReturnValueOnce(mockBarberSelectChain as any)
        .mockReturnValueOnce(mockConflictSelectChain as any);
      mockDb.insert.mockReturnValue(mockInsertChain as any);

      // Act
      await service.create(expensiveBookingDto, mockAuthUser);

      // Assert
      expect(mockInsertChain.values).toHaveBeenCalledWith(
        expect.objectContaining({
          totalPrice: '123.45',
        })
      );
    });

    it('should handle database insertion error', async () => {
      // Arrange
      const mockBarberSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockBarber]),
      };
      const mockConflictSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      const mockInsertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      mockDb.select
        .mockReturnValueOnce(mockBarberSelectChain as any)
        .mockReturnValueOnce(mockConflictSelectChain as any);
      mockDb.insert.mockReturnValue(mockInsertChain as any);

      // Act & Assert
      await expect(
        service.create(mockCreateBookingDto, mockAuthUser)
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all bookings without filters', async () => {
      // Arrange
      const mockBookings = [mockBooking, { ...mockBooking, id: 2 }];
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(mockBookings),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findAll({});

      // Assert
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockSelectChain.from).toHaveBeenCalledWith(bookings);
      expect(mockSelectChain.orderBy).toHaveBeenCalled();
      expect(result).toEqual(mockBookings);
    });

    it('should filter bookings by barberId', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([mockBooking]),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findAll({ barberId: 1 });

      // Assert
      expect(mockSelectChain.where).toHaveBeenCalled();
      expect(result).toEqual([mockBooking]);
    });

    it('should filter bookings by status', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([mockBooking]),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findAll({ status: BookingStatus.CONFIRMED });

      // Assert
      expect(mockSelectChain.where).toHaveBeenCalled();
      expect(result).toEqual([mockBooking]);
    });

    it('should filter bookings by date range', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([mockBooking]),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findAll({
        startDate: '2024-02-01',
        endDate: '2024-02-28',
      });

      // Assert
      expect(mockSelectChain.where).toHaveBeenCalled();
      expect(result).toEqual([mockBooking]);
    });

    it('should apply multiple filters', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([mockBooking]),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findAll(mockBookingQueryDto);

      // Assert
      expect(mockSelectChain.where).toHaveBeenCalled();
      expect(result).toEqual([mockBooking]);
    });

    it('should return empty array when no bookings found', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findAll({});

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database query error', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockRejectedValue(new Error('Query failed')),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act & Assert
      await expect(service.findAll({})).rejects.toThrow('Query failed');
    });
  });

  describe('findOne', () => {
    it('should return a booking when found', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockBooking]),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockSelectChain.from).toHaveBeenCalledWith(bookings);
      expect(mockSelectChain.where).toHaveBeenCalled();
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException when booking not found', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Booking with ID 999 not found'
      );
    });

    it('should handle database query error', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow('Database error');
    });
  });

  describe('findUserBookings', () => {
    it('should return user bookings', async () => {
      // Arrange
      const userBookings = [mockBooking, { ...mockBooking, id: 2 }];
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(userBookings),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findUserBookings('user_123');

      // Assert
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockSelectChain.from).toHaveBeenCalledWith(bookings);
      expect(mockSelectChain.where).toHaveBeenCalled();
      expect(mockSelectChain.orderBy).toHaveBeenCalled();
      expect(result).toEqual(userBookings);
    });

    it('should return empty array when user has no bookings', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findUserBookings('user_without_bookings');

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database query error', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockRejectedValue(new Error('User query failed')),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act & Assert
      await expect(service.findUserBookings('user_123')).rejects.toThrow(
        'User query failed'
      );
    });
  });

  describe('update', () => {
    beforeEach(() => {
      // Mock findOne for update method
      const mockFindOneChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockBooking]),
      };
      mockDb.select.mockReturnValue(mockFindOneChain as any);
    });

    it('should update a booking successfully', async () => {
      // Arrange
      const updatedBooking = { ...mockBooking, ...mockUpdateBookingDto };
      const mockUpdateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedBooking]),
      };
      mockDb.update.mockReturnValue(mockUpdateChain as any);

      // Act
      const result = await service.update(1, mockUpdateBookingDto);

      // Assert
      expect(mockDb.update).toHaveBeenCalledWith(bookings);
      expect(mockUpdateChain.set).toHaveBeenCalledWith({
        status: 'confirmed',
        notes: 'Updated notes',
        updatedAt: expect.any(Date),
      });
      expect(mockUpdateChain.where).toHaveBeenCalled();
      expect(result).toEqual(updatedBooking);
    });

    it('should handle appointmentDateTime conversion', async () => {
      // Arrange
      const updateWithDate = {
        appointmentDateTime: '2024-03-15T14:30:00Z',
      };
      const updatedBooking = {
        ...mockBooking,
        appointmentDateTime: new Date('2024-03-15T14:30:00Z'),
      };
      const mockUpdateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedBooking]),
      };
      mockDb.update.mockReturnValue(mockUpdateChain as any);

      // Act
      const result = await service.update(1, updateWithDate);

      // Assert
      expect(mockUpdateChain.set).toHaveBeenCalledWith({
        appointmentDateTime: new Date('2024-03-15T14:30:00Z'),
        updatedAt: expect.any(Date),
      });
      expect(result).toEqual(updatedBooking);
    });

    it('should throw NotFoundException when booking not found for update', async () => {
      // Arrange
      const mockUpdateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };
      mockDb.update.mockReturnValue(mockUpdateChain as any);

      // Act & Assert
      await expect(service.update(999, mockUpdateBookingDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should handle database update error', async () => {
      // Arrange
      const mockUpdateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(new Error('Update failed')),
      };
      mockDb.update.mockReturnValue(mockUpdateChain as any);

      // Act & Assert
      await expect(service.update(1, mockUpdateBookingDto)).rejects.toThrow(
        'Update failed'
      );
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      // Mock findOne for remove method
      const mockFindOneChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockBooking]),
      };
      mockDb.select.mockReturnValue(mockFindOneChain as any);
    });

    it('should remove a booking successfully', async () => {
      // Arrange
      const mockDeleteChain = {
        where: jest.fn().mockResolvedValue(undefined),
      };
      mockDb.delete.mockReturnValue(mockDeleteChain as any);

      // Act
      await service.remove(1);

      // Assert
      expect(mockDb.delete).toHaveBeenCalledWith(bookings);
      expect(mockDeleteChain.where).toHaveBeenCalled();
    });

    it('should throw NotFoundException when trying to remove non-existent booking', async () => {
      // Arrange
      const mockFindOneChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(mockFindOneChain as any);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should handle database deletion error', async () => {
      // Arrange
      const mockDeleteChain = {
        where: jest.fn().mockRejectedValue(new Error('Deletion failed')),
      };
      mockDb.delete.mockReturnValue(mockDeleteChain as any);

      // Act & Assert
      await expect(service.remove(1)).rejects.toThrow('Deletion failed');
    });
  });

  describe('cancel', () => {
    it('should cancel a booking successfully', async () => {
      // Arrange
      const cancelledBooking = {
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      };

      // Mock findOne
      const mockFindOneChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockBooking]),
      };

      // Mock update
      const mockUpdateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([cancelledBooking]),
      };

      mockDb.select.mockReturnValue(mockFindOneChain as any);
      mockDb.update.mockReturnValue(mockUpdateChain as any);

      // Act
      const result = await service.cancel(1, 'user_123');

      // Assert
      expect(result.status).toBe(BookingStatus.CANCELLED);
    });

    it('should throw BadRequestException when user tries to cancel someone elses booking', async () => {
      // Arrange
      const mockFindOneChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockBooking]),
      };
      mockDb.select.mockReturnValue(mockFindOneChain as any);

      // Act & Assert
      await expect(service.cancel(1, 'different_user')).rejects.toThrow(
        BadRequestException
      );
      await expect(service.cancel(1, 'different_user')).rejects.toThrow(
        'You can only cancel your own bookings'
      );
    });

    it('should throw BadRequestException when booking is already cancelled', async () => {
      // Arrange
      const cancelledBooking = {
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      };
      const mockFindOneChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([cancelledBooking]),
      };
      mockDb.select.mockReturnValue(mockFindOneChain as any);

      // Act & Assert
      await expect(service.cancel(1, 'user_123')).rejects.toThrow(
        BadRequestException
      );
      await expect(service.cancel(1, 'user_123')).rejects.toThrow(
        'Booking is already cancelled'
      );
    });
  });

  describe('confirm', () => {
    it('should confirm a pending booking successfully', async () => {
      // Arrange
      const confirmedBooking = {
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      };

      // Mock findOne
      const mockFindOneChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockBooking]),
      };

      // Mock update
      const mockUpdateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([confirmedBooking]),
      };

      mockDb.select.mockReturnValue(mockFindOneChain as any);
      mockDb.update.mockReturnValue(mockUpdateChain as any);

      // Act
      const result = await service.confirm(1);

      // Assert
      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });

    it('should throw BadRequestException when booking is not pending', async () => {
      // Arrange
      const confirmedBooking = {
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      };
      const mockFindOneChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([confirmedBooking]),
      };
      mockDb.select.mockReturnValue(mockFindOneChain as any);

      // Act & Assert
      await expect(service.confirm(1)).rejects.toThrow(BadRequestException);
      await expect(service.confirm(1)).rejects.toThrow(
        'Only pending bookings can be confirmed'
      );
    });

    it('should throw NotFoundException when booking does not exist', async () => {
      // Arrange
      const mockFindOneChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(mockFindOneChain as any);

      // Act & Assert
      await expect(service.confirm(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle invalid date formats gracefully', async () => {
      // Arrange
      const invalidBookingDto = {
        ...mockCreateBookingDto,
        appointmentDateTime: 'invalid-date',
      };
      const mockBarberSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockBarber]),
      };
      mockDb.select.mockReturnValue(mockBarberSelectChain as any);

      // Act & Assert
      // This should either handle the invalid date gracefully or throw an appropriate error
      await expect(
        service.create(invalidBookingDto, mockAuthUser)
      ).rejects.toThrow();
    });

    it.skip('should handle concurrent booking attempts', async () => {
      // Arrange - Each service call needs separate mock chains since Drizzle chains are consumed
      const createMockSelectChain = () => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockBarber]),
      });

      const createMockConflictChain = () => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      });

      const mockInsertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockBooking]),
      };

      // Set up mocks for 3 concurrent calls (6 select calls total - 2 per booking)
      mockDb.select
        .mockReturnValueOnce(createMockSelectChain() as any) // Call 1 - barber check
        .mockReturnValueOnce(createMockConflictChain() as any) // Call 1 - conflict check
        .mockReturnValueOnce(createMockSelectChain() as any) // Call 2 - barber check
        .mockReturnValueOnce(createMockConflictChain() as any) // Call 2 - conflict check
        .mockReturnValueOnce(createMockSelectChain() as any) // Call 3 - barber check
        .mockReturnValueOnce(createMockConflictChain() as any); // Call 3 - conflict check
      mockDb.insert.mockReturnValue(mockInsertChain as any);

      // Act
      const promises = [
        service.create(mockCreateBookingDto, mockAuthUser),
        service.create(mockCreateBookingDto, mockAuthUser),
        service.create(mockCreateBookingDto, mockAuthUser),
      ];

      // Assert
      // All should complete (though in real scenario, some might fail due to conflicts)
      await Promise.all(promises);
      expect(mockDb.insert).toHaveBeenCalledTimes(3);
    });

    it('should handle null/undefined inputs gracefully', async () => {
      // Arrange - Set up mock to return empty result for null queries
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]), // Return empty array to trigger NotFoundException
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act & Assert
      await expect(service.create(null as any)).rejects.toThrow();
      await expect(service.findOne(null as any)).rejects.toThrow();
      await expect(service.update(null as any, {})).rejects.toThrow();
    });

    it('should handle database connection timeouts', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockRejectedValue(new Error('Connection timeout')),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act & Assert
      await expect(service.findAll({})).rejects.toThrow('Connection timeout');
    });

    it('should handle malformed database responses', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([null, undefined, {}]),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});
