/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { BookingController } from '../../../src/controllers/booking.controller';
import { BookingService } from '../../../src/services/booking.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
} from '../../../src/dto/booking.dto';
import { BookingStatus, type BookingStatusType } from '../../../src/schema';

describe('BookingController', () => {
  let controller: BookingController;
  let service: jest.Mocked<BookingService>;

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

  const mockCreateBookingDto: CreateBookingDto = {
    barberId: 1,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1234567890',
    serviceName: 'Premium Haircut',
    totalPrice: '50',
    durationMinutes: 45,
    appointmentDateTime: '2024-01-15T10:00:00Z',
    notes: 'Special instructions',
  };

  const mockUpdateBookingDto: UpdateBookingDto = {
    status: 'completed',
    notes: 'Completed successfully',
  };

  const mockBookingService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findUserBookings: jest.fn(),
    cancel: jest.fn(),
    confirm: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: mockBookingService,
        },
      ],
    }).compile();

    controller = module.get<BookingController>(BookingController);
    service = module.get<BookingService>(
      BookingService
    ) as jest.Mocked<BookingService>;

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new booking', async () => {
      // Arrange
      mockBookingService.create.mockResolvedValue(mockBooking);

      // Act
      const result = await controller.create(mockCreateBookingDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(mockCreateBookingDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBooking);
    });

    it('should handle double booking conflicts', async () => {
      // Arrange
      const conflictError = new ConflictException(
        'Barber is not available at this time'
      );
      mockBookingService.create.mockRejectedValue(conflictError);

      // Act & Assert
      await expect(controller.create(mockCreateBookingDto)).rejects.toThrow(
        ConflictException
      );
      await expect(controller.create(mockCreateBookingDto)).rejects.toThrow(
        'Barber is not available at this time'
      );
      expect(service.create).toHaveBeenCalledWith(mockCreateBookingDto);
    });

    it('should handle past date validation', async () => {
      // Arrange
      const pastDateDto = {
        ...mockCreateBookingDto,
        appointmentDateTime: '2020-01-01T10:00:00Z',
      };
      const validationError = new Error('Cannot book appointments in the past');
      mockBookingService.create.mockRejectedValue(validationError);

      // Act & Assert
      await expect(controller.create(pastDateDto)).rejects.toThrow(
        'Cannot book appointments in the past'
      );
      expect(service.create).toHaveBeenCalledWith(pastDateDto);
    });

    it('should handle invalid barber ID', async () => {
      // Arrange
      const invalidBarberDto = {
        ...mockCreateBookingDto,
        barberId: 999,
      };
      const notFoundError = new NotFoundException('Barber not found');
      mockBookingService.create.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.create(invalidBarberDto)).rejects.toThrow(
        NotFoundException
      );
      expect(service.create).toHaveBeenCalledWith(invalidBarberDto);
    });

    it('should handle service errors during creation', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockBookingService.create.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.create(mockCreateBookingDto)).rejects.toThrow(
        'Database connection failed'
      );
      expect(service.create).toHaveBeenCalledWith(mockCreateBookingDto);
    });

    it('should handle different service types', async () => {
      // Arrange
      const premiumServiceDto = {
        ...mockCreateBookingDto,
        serviceName: 'Premium Cut & Style',
        totalPrice: '75',
        durationMinutes: 90,
      };
      const premiumBooking = { ...mockBooking, ...premiumServiceDto };
      mockBookingService.create.mockResolvedValue(premiumBooking);

      // Act
      const result = await controller.create(premiumServiceDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(premiumServiceDto);
      expect(result.totalPrice).toBe('75');
      expect(result.durationMinutes).toBe(90);
    });

    it('should handle zero price bookings', async () => {
      // Arrange
      const freeServiceDto = {
        ...mockCreateBookingDto,
        totalPrice: '0',
      };
      const freeBooking = { ...mockBooking, totalPrice: '0.00' };
      mockBookingService.create.mockResolvedValue(freeBooking);

      // Act
      const result = await controller.create(freeServiceDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(freeServiceDto);
      expect(result.totalPrice).toBe('0.00');
    });
  });

  describe('findAll', () => {
    it('should return an array of bookings', async () => {
      // Arrange
      const mockBookings = [
        mockBooking,
        { ...mockBooking, id: 2, customerName: 'Jane Customer' },
      ];
      mockBookingService.findAll.mockResolvedValue(mockBookings);

      // Act
      const result = await controller.findAll({});

      // Assert
      expect(service.findAll).toHaveBeenCalled();
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBookings);
    });

    it('should return empty array when no bookings found', async () => {
      // Arrange
      mockBookingService.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll({});

      // Assert
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle service errors during findAll', async () => {
      // Arrange
      const error = new Error('Database query failed');
      mockBookingService.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findAll({})).rejects.toThrow(
        'Database query failed'
      );
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should handle large datasets efficiently', async () => {
      // Arrange
      const largeDataset = Array.from({ length: 500 }, (_, i) => ({
        ...mockBooking,
        id: i + 1,
        customerName: `Customer ${i + 1}`,
      }));
      mockBookingService.findAll.mockResolvedValue(largeDataset);

      // Act
      const result = await controller.findAll({});

      // Assert
      expect(result).toHaveLength(500);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single booking', async () => {
      // Arrange
      mockBookingService.findOne.mockResolvedValue(mockBooking);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBooking);
    });

    it('should handle NotFoundException', async () => {
      // Arrange
      const notFoundError = new NotFoundException(
        'Booking with ID 999 not found'
      );
      mockBookingService.findOne.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(controller.findOne(999)).rejects.toThrow(
        'Booking with ID 999 not found'
      );
      expect(service.findOne).toHaveBeenCalledWith(999);
    });

    it('should handle invalid ID types', async () => {
      // Arrange
      const invalidId = 'invalid' as unknown as number;
      mockBookingService.findOne.mockRejectedValue(new Error('Invalid ID'));

      // Act & Assert
      await expect(controller.findOne(invalidId)).rejects.toThrow();
      expect(service.findOne).toHaveBeenCalledWith(invalidId);
    });

    it('should handle zero ID', async () => {
      // Arrange
      mockBookingService.findOne.mockRejectedValue(
        new NotFoundException('Booking with ID 0 not found')
      );

      // Act & Assert
      await expect(controller.findOne(0)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(0);
    });
  });

  describe('getUserAppointments', () => {
    const mockUser = {
      id: 'user_123',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };

    const mockUserBookings = [
      {
        ...mockBooking,
        clerkUserId: 'user_123',
      },
      {
        ...mockBooking,
        id: 2,
        serviceName: 'Beard Trim',
        totalPrice: '15.00',
        clerkUserId: 'user_123',
      },
    ];

    it('should return user appointments', async () => {
      // Arrange
      mockBookingService.findUserBookings.mockResolvedValue(mockUserBookings);

      // Act
      const result = await controller.getUserAppointments(mockUser);

      // Assert
      expect(service.findUserBookings).toHaveBeenCalledWith('user_123');
      expect(service.findUserBookings).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserBookings);
    });

    it('should return empty array for user with no appointments', async () => {
      // Arrange
      mockBookingService.findUserBookings.mockResolvedValue([]);

      // Act
      const result = await controller.getUserAppointments(mockUser);

      // Assert
      expect(service.findUserBookings).toHaveBeenCalledWith('user_123');
      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      mockBookingService.findUserBookings.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.getUserAppointments(mockUser)).rejects.toThrow(
        'Database connection failed'
      );
      expect(service.findUserBookings).toHaveBeenCalledWith('user_123');
    });
  });

  describe('update', () => {
    it('should update a booking successfully', async () => {
      // Arrange
      const updatedBooking = { ...mockBooking, ...mockUpdateBookingDto };
      mockBookingService.update.mockResolvedValue(updatedBooking);

      // Act
      const result = await controller.update(1, mockUpdateBookingDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, mockUpdateBookingDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedBooking);
    });

    it('should handle status updates', async () => {
      // Arrange
      const statusUpdate: UpdateBookingDto = {
        status: BookingStatus.CANCELLED,
      };
      const updatedBooking = { ...mockBooking, status: 'cancelled' };
      mockBookingService.update.mockResolvedValue(updatedBooking);

      // Act
      const result = await controller.update(1, statusUpdate);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, statusUpdate);
      expect(result.status).toBe('cancelled');
    });

    it('should handle notes updates', async () => {
      // Arrange
      const notesUpdate: UpdateBookingDto = { notes: 'Updated notes' };
      const updatedBooking = { ...mockBooking, notes: 'Updated notes' };
      mockBookingService.update.mockResolvedValue(updatedBooking);

      // Act
      const result = await controller.update(1, notesUpdate);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, notesUpdate);
      expect(result.notes).toBe('Updated notes');
    });

    it('should handle NotFoundException during update', async () => {
      // Arrange
      const notFoundError = new NotFoundException(
        'Booking with ID 999 not found'
      );
      mockBookingService.update.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(
        controller.update(999, mockUpdateBookingDto)
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(999, mockUpdateBookingDto);
    });

    it('should handle empty update data', async () => {
      // Arrange
      const emptyUpdate = {};
      mockBookingService.update.mockResolvedValue(mockBooking);

      // Act
      const result = await controller.update(1, emptyUpdate);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, emptyUpdate);
      expect(result).toEqual(mockBooking);
    });

    it('should handle date reschedule', async () => {
      // Arrange
      const newDate = '2024-02-16T14:00:00Z';
      const rescheduleUpdate = { appointmentDateTime: newDate };
      const updatedBooking = {
        ...mockBooking,
        appointmentDateTime: new Date(newDate),
      };
      mockBookingService.update.mockResolvedValue(updatedBooking);

      // Act
      const result = await controller.update(1, rescheduleUpdate);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, rescheduleUpdate);
      expect(result.appointmentDateTime).toEqual(new Date(newDate));
    });

    it('should handle invalid status transitions', async () => {
      // Arrange
      const invalidStatusUpdate: UpdateBookingDto = {
        status: 'invalid_status' as BookingStatusType,
      };
      const validationError = new Error('Invalid status transition');
      mockBookingService.update.mockRejectedValue(validationError);

      // Act & Assert
      await expect(controller.update(1, invalidStatusUpdate)).rejects.toThrow(
        'Invalid status transition'
      );
      expect(service.update).toHaveBeenCalledWith(1, invalidStatusUpdate);
    });
  });

  describe('remove', () => {
    it('should remove a booking successfully', async () => {
      // Arrange
      mockBookingService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(1);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: 'Booking deleted successfully' });
    });

    it('should handle NotFoundException during removal', async () => {
      // Arrange
      const notFoundError = new NotFoundException(
        'Booking with ID 999 not found'
      );
      mockBookingService.remove.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(999);
    });

    it('should handle service errors during removal', async () => {
      // Arrange
      const error = new Error('Deletion failed');
      mockBookingService.remove.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.remove(1)).rejects.toThrow('Deletion failed');
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should handle removal of confirmed bookings', async () => {
      // Arrange
      const businessRuleError = new Error(
        'Cannot delete confirmed booking within 24 hours'
      );
      mockBookingService.remove.mockRejectedValue(businessRuleError);

      // Act & Assert
      await expect(controller.remove(1)).rejects.toThrow(
        'Cannot delete confirmed booking within 24 hours'
      );
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('cancel', () => {
    const mockUser = {
      id: 'user_123',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should cancel a booking successfully', async () => {
      // Arrange
      const cancelledBooking = { ...mockBooking, status: 'cancelled' };
      mockBookingService.cancel.mockResolvedValue(cancelledBooking);

      // Act
      const result = await controller.cancel(1, mockUser);

      // Assert
      expect(service.cancel).toHaveBeenCalledWith(1, 'user_123');
      expect(service.cancel).toHaveBeenCalledTimes(1);
      expect(result).toEqual(cancelledBooking);
    });

    it('should handle unauthorized cancellation', async () => {
      // Arrange
      const unauthorizedError = new Error(
        'You can only cancel your own bookings'
      );
      mockBookingService.cancel.mockRejectedValue(unauthorizedError);

      // Act & Assert
      await expect(controller.cancel(1, mockUser)).rejects.toThrow(
        'You can only cancel your own bookings'
      );
      expect(service.cancel).toHaveBeenCalledWith(1, 'user_123');
    });

    it('should handle already cancelled booking', async () => {
      // Arrange
      const alreadyCancelledError = new Error('Booking is already cancelled');
      mockBookingService.cancel.mockRejectedValue(alreadyCancelledError);

      // Act & Assert
      await expect(controller.cancel(1, mockUser)).rejects.toThrow(
        'Booking is already cancelled'
      );
      expect(service.cancel).toHaveBeenCalledWith(1, 'user_123');
    });

    it('should handle NotFoundException during cancellation', async () => {
      // Arrange
      const notFoundError = new NotFoundException(
        'Booking with ID 999 not found'
      );
      mockBookingService.cancel.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.cancel(999, mockUser)).rejects.toThrow(
        NotFoundException
      );
      expect(service.cancel).toHaveBeenCalledWith(999, 'user_123');
    });
  });

  describe('confirm', () => {
    it('should confirm a booking successfully', async () => {
      // Arrange
      const confirmedBooking = { ...mockBooking, status: 'confirmed' };
      mockBookingService.confirm.mockResolvedValue(confirmedBooking);

      // Act
      const result = await controller.confirm(1);

      // Assert
      expect(service.confirm).toHaveBeenCalledWith(1);
      expect(service.confirm).toHaveBeenCalledTimes(1);
      expect(result).toEqual(confirmedBooking);
    });

    it('should handle NotFoundException during confirmation', async () => {
      // Arrange
      const notFoundError = new NotFoundException(
        'Booking with ID 999 not found'
      );
      mockBookingService.confirm.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.confirm(999)).rejects.toThrow(NotFoundException);
      expect(service.confirm).toHaveBeenCalledWith(999);
    });

    it('should handle already confirmed booking', async () => {
      // Arrange
      const alreadyConfirmedError = new Error('Booking is already confirmed');
      mockBookingService.confirm.mockRejectedValue(alreadyConfirmedError);

      // Act & Assert
      await expect(controller.confirm(1)).rejects.toThrow(
        'Booking is already confirmed'
      );
      expect(service.confirm).toHaveBeenCalledWith(1);
    });

    it('should handle service errors during confirmation', async () => {
      // Arrange
      const error = new Error('Confirmation failed');
      mockBookingService.confirm.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.confirm(1)).rejects.toThrow(
        'Confirmation failed'
      );
      expect(service.confirm).toHaveBeenCalledWith(1);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle concurrent booking requests', async () => {
      // Arrange
      const conflictError = new ConflictException(
        'Time slot no longer available'
      );
      mockBookingService.create
        .mockResolvedValueOnce(mockBooking)
        .mockRejectedValueOnce(conflictError);

      // Act
      const [result1, error] = await Promise.allSettled([
        controller.create(mockCreateBookingDto),
        controller.create(mockCreateBookingDto),
      ]);

      // Assert
      expect(result1.status).toBe('fulfilled');
      expect(error.status).toBe('rejected');
      expect(service.create).toHaveBeenCalledTimes(2);
    });

    it('should handle service timeout errors', async () => {
      // Arrange
      const timeoutError = new Error('Request timeout');
      mockBookingService.findAll.mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(controller.findAll({})).rejects.toThrow('Request timeout');
    });

    it('should handle malformed service responses', async () => {
      // Arrange
      mockBookingService.findOne.mockResolvedValue(null);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should maintain proper method signatures', () => {
      // Assert
      expect(typeof controller.create).toBe('function');
      expect(typeof controller.findAll).toBe('function');
      expect(typeof controller.findOne).toBe('function');
      expect(typeof controller.update).toBe('function');
      expect(typeof controller.remove).toBe('function');
    });

    it('should handle very large booking amounts', async () => {
      // Arrange
      const expensiveServiceDto = {
        ...mockCreateBookingDto,
        totalPrice: '999.99',
        serviceName: 'VIP Executive Package',
      };
      const expensiveBooking = { ...mockBooking, totalPrice: '999.99' };
      mockBookingService.create.mockResolvedValue(expensiveBooking);

      // Act
      const result = await controller.create(expensiveServiceDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(expensiveServiceDto);
      expect(result.totalPrice).toBe('999.99');
    });

    it('should handle edge case durations', async () => {
      // Arrange
      const shortDurationDto = {
        ...mockCreateBookingDto,
        durationMinutes: 15,
        serviceName: 'Quick Touch-up',
      };
      const longDurationDto = {
        ...mockCreateBookingDto,
        durationMinutes: 240,
        serviceName: 'Full Day Grooming',
      };
      mockBookingService.create
        .mockResolvedValueOnce({ ...mockBooking, durationMinutes: 15 })
        .mockResolvedValueOnce({ ...mockBooking, durationMinutes: 240 });

      // Act
      const [shortResult, longResult] = await Promise.all([
        controller.create(shortDurationDto),
        controller.create(longDurationDto),
      ]);

      // Assert
      expect(shortResult.durationMinutes).toBe(15);
      expect(longResult.durationMinutes).toBe(240);
    });
  });

  describe('input validation scenarios', () => {
    it('should handle complex customer data', async () => {
      // Arrange
      const complexDto: CreateBookingDto = {
        barberId: 1,
        customerName: 'José María García-López',
        customerEmail: 'jose.maria+barbershop@complex-domain.co.uk',
        customerPhone: '+34 91 123 45 67',
        serviceName: 'Premium Grooming & Styling Experience',
        totalPrice: '125.5',
        appointmentDateTime: '2024-12-25T09:30:00Z',
        durationMinutes: 120,
        notes:
          'Customer has allergies to certain products. Prefer eco-friendly options.',
      };
      mockBookingService.create.mockResolvedValue(mockBooking);

      // Act
      const result = await controller.create(complexDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(complexDto);
      expect(result).toEqual(mockBooking);
    });

    it('should handle unicode characters in customer data', async () => {
      // Arrange
      const unicodeDto: CreateBookingDto = {
        barberId: 1,
        customerName: '李小明 🧔‍♂️',
        customerEmail: 'ming@中文.com',
        customerPhone: '+86 138 0013 8000',
        serviceName: 'Traditional Chinese Grooming 中式理发',
        totalPrice: '88.88',
        appointmentDateTime: '2024-02-15T10:00:00Z',
        durationMinutes: 60,
        notes: '需要传统理发服务',
      };
      mockBookingService.create.mockResolvedValue(mockBooking);

      // Act
      const result = await controller.create(unicodeDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(unicodeDto);
      expect(result).toEqual(mockBooking);
    });

    it('should handle boundary time values', async () => {
      // Arrange
      const earlyMorningDto = {
        ...mockCreateBookingDto,
        appointmentDateTime: '2024-02-15T06:00:00Z',
      };
      const lateEveningDto = {
        ...mockCreateBookingDto,
        appointmentDateTime: '2024-02-15T22:00:00Z',
      };
      mockBookingService.create
        .mockResolvedValueOnce(mockBooking)
        .mockResolvedValueOnce(mockBooking);

      // Act
      const [earlyResult, lateResult] = await Promise.all([
        controller.create(earlyMorningDto),
        controller.create(lateEveningDto),
      ]);

      // Assert
      expect(service.create).toHaveBeenCalledWith(earlyMorningDto);
      expect(service.create).toHaveBeenCalledWith(lateEveningDto);
      expect(earlyResult).toEqual(mockBooking);
      expect(lateResult).toEqual(mockBooking);
    });

    it('should handle maximum length strings', async () => {
      // Arrange
      const maxLengthDto: CreateBookingDto = {
        barberId: 1,
        customerName: 'A'.repeat(100),
        customerEmail: `${'a'.repeat(50)}@${'b'.repeat(50)}.com`,
        customerPhone: '+1234567890123456789',
        serviceName: 'S'.repeat(200),
        totalPrice: '999.99',
        appointmentDateTime: '2024-02-15T10:00:00Z',
        durationMinutes: 480,
        notes: 'N'.repeat(1000),
      };
      mockBookingService.create.mockResolvedValue(mockBooking);

      // Act
      const result = await controller.create(maxLengthDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(maxLengthDto);
      expect(result).toEqual(mockBooking);
    });

    it('should handle null and undefined optional fields', async () => {
      // Arrange
      const minimalDto: CreateBookingDto = {
        barberId: 1,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        serviceName: 'Haircut',
        totalPrice: '25',
        appointmentDateTime: '2024-02-15T10:00:00Z',
        durationMinutes: 60,
        // notes is optional
      };
      mockBookingService.create.mockResolvedValue(mockBooking);

      // Act
      const result = await controller.create(minimalDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(minimalDto);
      expect(result).toEqual(mockBooking);
    });
  });
});
