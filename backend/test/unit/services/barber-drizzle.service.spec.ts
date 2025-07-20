/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BarberService } from '../../../src/services/barber-drizzle.service';
import { RealtimeService } from '../../../src/services/realtime.service';
import { StorageService } from '../../../src/services/storage.service';
import { db } from '../../../src/database/database';
import { CreateBarberDto, UpdateBarberDto } from '../../../src/dto/barber.dto';

// Mock the schema module first to avoid relations issues
jest.mock('../../../src/schema', () => ({
  barbers: 'barbers_table',
  bookings: 'bookings_table',
  availabilities: 'availabilities_table',
  barbersRelations: {},
  BookingStatus: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
}));

import { barbers, bookings, availabilities } from '../../../src/schema';

// Mock the database module
jest.mock('../../../src/database/database', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    selectDistinct: jest.fn(),
  },
}));

// Mock Drizzle ORM functions
jest.mock('drizzle-orm', () => ({
  eq: jest.fn((field, value) => ({ field, value, type: 'eq' })),
  and: jest.fn((...conditions) => ({ conditions, type: 'and' })),
}));

const mockDb = db as jest.Mocked<typeof db>;

// Mock services
const mockRealtimeService = {
  broadcastEvent: jest.fn().mockResolvedValue(undefined),
};

const mockStorageService = {
  uploadFile: jest.fn().mockResolvedValue('uploads/test-file.jpg'),
  deleteFile: jest.fn().mockResolvedValue(undefined),
};

describe('BarberService', () => {
  let service: BarberService;

  const mockBarber = {
    id: 1,
    name: 'John Doe',
    title: 'Master Barber',
    bio: 'Experienced barber with 10+ years',
    image: '/images/barber1.jpg',
    experienceYears: 10,
    specialties: ['Classic Cuts', 'Beard Styling'],
    rating: '4.5',
    reviewCount: 25,
    isActive: true,
    phone: '+1234567890',
    email: 'john@wizcuts.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockCreateBarberDto: CreateBarberDto = {
    name: 'John Doe',
    title: 'Master Barber',
    bio: 'Experienced barber with 10+ years',
    image: '/images/barber1.jpg',
    experienceYears: 10,
    specialties: ['Classic Cuts', 'Beard Styling'],
    phone: '+1234567890',
    email: 'john@wizcuts.com',
  };

  const mockUpdateBarberDto: UpdateBarberDto = {
    name: 'John Smith',
    rating: 4.8,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BarberService,
        {
          provide: RealtimeService,
          useValue: mockRealtimeService,
        },
        {
          provide: StorageService, 
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<BarberService>(BarberService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new barber successfully', async () => {
      // Arrange
      const mockInsertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockBarber]),
      };
      mockDb.insert.mockReturnValue(mockInsertChain as any);

      // Act
      const result = await service.create(mockCreateBarberDto);

      // Assert
      expect(mockDb.insert).toHaveBeenCalledWith(barbers);
      expect(mockInsertChain.values).toHaveBeenCalledWith({
        ...mockCreateBarberDto,
        rating: '0.00', // Default rating as string
      });
      expect(mockInsertChain.returning).toHaveBeenCalled();
      expect(result).toEqual(mockBarber);
    });

    it('should handle database insertion error', async () => {
      // Arrange
      const mockInsertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      mockDb.insert.mockReturnValue(mockInsertChain as any);

      // Act & Assert
      await expect(service.create(mockCreateBarberDto)).rejects.toThrow(
        'Database error',
      );
    });

    it('should set default rating to 0.00', async () => {
      // Arrange
      const mockInsertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockBarber]),
      };
      mockDb.insert.mockReturnValue(mockInsertChain as any);

      // Act
      await service.create(mockCreateBarberDto);

      // Assert
      expect(mockInsertChain.values).toHaveBeenCalledWith(
        expect.objectContaining({
          rating: '0.00',
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all active barbers', async () => {
      // Arrange
      const mockBarbers = [
        mockBarber,
        { ...mockBarber, id: 2, name: 'Jane Doe' },
      ];
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(mockBarbers),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockSelectChain.from).toHaveBeenCalledWith(barbers);
      expect(mockSelectChain.where).toHaveBeenCalled();
      expect(mockSelectChain.orderBy).toHaveBeenCalled();
      expect(result).toEqual(mockBarbers);
    });

    it('should return empty array when no barbers found', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findAll();

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
      await expect(service.findAll()).rejects.toThrow('Query failed');
    });
  });

  describe('findOne', () => {
    it('should return a barber when found', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockBarber]),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockSelectChain.from).toHaveBeenCalledWith(barbers);
      expect(mockSelectChain.where).toHaveBeenCalled();
      expect(result).toEqual(mockBarber);
    });

    it('should throw NotFoundException when barber not found', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Barber with ID 999 not found',
      );
    });

    it('should throw NotFoundException when undefined is returned', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([undefined]),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should handle database query error', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest
          .fn()
          .mockRejectedValue(new Error('Database connection lost')),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow(
        'Database connection lost',
      );
    });
  });

  describe('update', () => {
    it('should update a barber successfully', async () => {
      // Arrange
      const updatedBarber = {
        ...mockBarber,
        ...mockUpdateBarberDto,
        rating: '4.8',
      };
      const mockUpdateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedBarber]),
      };
      mockDb.update.mockReturnValue(mockUpdateChain as any);

      // Act
      const result = await service.update(1, mockUpdateBarberDto);

      // Assert
      expect(mockDb.update).toHaveBeenCalledWith(barbers);
      expect(mockUpdateChain.set).toHaveBeenCalledWith({
        name: 'John Smith',
        rating: '4.8', // Converted to string
        updatedAt: expect.any(Date),
      });
      expect(mockUpdateChain.where).toHaveBeenCalled();
      expect(mockUpdateChain.returning).toHaveBeenCalled();
      expect(result).toEqual(updatedBarber);
    });

    it('should handle rating conversion correctly', async () => {
      // Arrange
      const updateDto = { rating: 4.75 };
      const updatedBarber = { ...mockBarber, rating: '4.75' };
      const mockUpdateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedBarber]),
      };
      mockDb.update.mockReturnValue(mockUpdateChain as any);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(mockUpdateChain.set).toHaveBeenCalledWith({
        rating: '4.75',
        updatedAt: expect.any(Date),
      });
      expect(result).toEqual(updatedBarber);
    });

    it('should throw NotFoundException when barber not found for update', async () => {
      // Arrange
      const mockUpdateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };
      mockDb.update.mockReturnValue(mockUpdateChain as any);

      // Act & Assert
      await expect(service.update(999, mockUpdateBarberDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update without rating field', async () => {
      // Arrange
      const updateDto = { name: 'Updated Name' };
      const updatedBarber = { ...mockBarber, name: 'Updated Name' };
      const mockUpdateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedBarber]),
      };
      mockDb.update.mockReturnValue(mockUpdateChain as any);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(mockUpdateChain.set).toHaveBeenCalledWith({
        name: 'Updated Name',
        updatedAt: expect.any(Date),
      });
      expect(result).toEqual(updatedBarber);
    });

    it('should handle partial updates', async () => {
      // Arrange
      const partialUpdate = { phone: '+0987654321' };
      const updatedBarber = { ...mockBarber, phone: '+0987654321' };
      const mockUpdateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedBarber]),
      };
      mockDb.update.mockReturnValue(mockUpdateChain as any);

      // Act
      const result = await service.update(1, partialUpdate);

      // Assert
      expect(mockUpdateChain.set).toHaveBeenCalledWith({
        phone: '+0987654321',
        updatedAt: expect.any(Date),
      });
      expect(result).toEqual(updatedBarber);
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
      await expect(service.update(1, mockUpdateBarberDto)).rejects.toThrow(
        'Update failed',
      );
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      // Mock findOne for remove method
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockBarber]),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);
    });

    it('should remove a barber successfully', async () => {
      // Arrange
      const mockDeleteChain = {
        where: jest.fn().mockResolvedValue(undefined),
      };
      mockDb.delete.mockReturnValue(mockDeleteChain as any);

      // Act
      await service.remove(1);

      // Assert
      expect(mockDb.select).toHaveBeenCalled(); // Called by findOne
      expect(mockDb.delete).toHaveBeenCalledWith(barbers);
      expect(mockDeleteChain.where).toHaveBeenCalled();
    });

    it('should throw NotFoundException when trying to remove non-existent barber', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

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

  describe('findByAvailability', () => {
    it('should return barbers available on a specific day', async () => {
      // Arrange
      const testDate = new Date('2024-01-15'); // Monday
      const mockAvailableBarbers = [mockBarber];
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockAvailableBarbers),
      };
      mockDb.selectDistinct.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findByAvailability(testDate);

      // Assert
      expect(mockDb.selectDistinct).toHaveBeenCalled();
      expect(mockSelectChain.from).toHaveBeenCalledWith(barbers);
      expect(mockSelectChain.innerJoin).toHaveBeenCalledWith(
        availabilities,
        expect.anything(),
      );
      expect(mockSelectChain.where).toHaveBeenCalled();
      expect(result).toEqual(mockAvailableBarbers);
    });

    it('should handle different days of the week correctly', async () => {
      // Arrange
      const testDates = [
        new Date('2024-01-14'), // Sunday (0)
        new Date('2024-01-15'), // Monday (1)
        new Date('2024-01-16'), // Tuesday (2)
        new Date('2024-01-17'), // Wednesday (3)
        new Date('2024-01-18'), // Thursday (4)
        new Date('2024-01-19'), // Friday (5)
        new Date('2024-01-20'), // Saturday (6)
      ];

      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      mockDb.selectDistinct.mockReturnValue(mockSelectChain as any);

      // Act & Assert
      for (const date of testDates) {
        const result = await service.findByAvailability(date);
        expect(result).toEqual([]);
        expect(mockSelectChain.where).toHaveBeenCalled();
        jest.clearAllMocks();
        mockDb.selectDistinct.mockReturnValue(mockSelectChain as any);
      }
    });

    it('should return empty array when no barbers available', async () => {
      // Arrange
      const testDate = new Date('2024-01-16');
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      mockDb.selectDistinct.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findByAvailability(testDate);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database query error', async () => {
      // Arrange
      const testDate = new Date('2024-01-15');
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest
          .fn()
          .mockRejectedValue(new Error('Availability query failed')),
      };
      mockDb.selectDistinct.mockReturnValue(mockSelectChain as any);

      // Act & Assert
      await expect(service.findByAvailability(testDate)).rejects.toThrow(
        'Availability query failed',
      );
    });
  });

  describe('findBusyBarbers', () => {
    it('should return barber IDs with bookings at specified time', async () => {
      // Arrange
      const testDate = new Date('2024-01-15');
      const startTime = '10:00';
      const mockBusyBookings = [{ barberId: 1 }, { barberId: 2 }];
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockBusyBookings),
      };
      mockDb.selectDistinct.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findBusyBarbers(testDate, startTime);

      // Assert
      expect(mockDb.selectDistinct).toHaveBeenCalledWith({
        barberId: bookings.barberId,
      });
      expect(mockSelectChain.from).toHaveBeenCalledWith(bookings);
      expect(mockSelectChain.where).toHaveBeenCalled();
      expect(result).toEqual([1, 2]);
    });

    it('should return empty array when no busy barbers', async () => {
      // Arrange
      const testDate = new Date('2024-01-15');
      const startTime = '10:00';
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      mockDb.selectDistinct.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findBusyBarbers(testDate, startTime);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle date string conversion correctly', async () => {
      // Arrange
      const testDate = new Date('2024-01-15T15:30:00Z');
      const startTime = '14:30';
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      mockDb.selectDistinct.mockReturnValue(mockSelectChain as any);

      // Act
      await service.findBusyBarbers(testDate, startTime);

      // Assert
      expect(mockSelectChain.where).toHaveBeenCalled();
      // The date should be converted to YYYY-MM-DD format and combined with time
    });

    it('should handle multiple busy barbers', async () => {
      // Arrange
      const testDate = new Date('2024-01-15');
      const startTime = '14:00';
      const mockBusyBookings = [
        { barberId: 1 },
        { barberId: 3 },
        { barberId: 5 },
        { barberId: 7 },
      ];
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockBusyBookings),
      };
      mockDb.selectDistinct.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findBusyBarbers(testDate, startTime);

      // Assert
      expect(result).toEqual([1, 3, 5, 7]);
    });

    it('should handle database query error', async () => {
      // Arrange
      const testDate = new Date('2024-01-15');
      const startTime = '10:00';
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest
          .fn()
          .mockRejectedValue(new Error('Busy barbers query failed')),
      };
      mockDb.selectDistinct.mockReturnValue(mockSelectChain as any);

      // Act & Assert
      await expect(
        service.findBusyBarbers(testDate, startTime),
      ).rejects.toThrow('Busy barbers query failed');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null/undefined input for create', async () => {
      // Arrange
      const mockInsertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(new Error('Invalid input')),
      };
      mockDb.insert.mockReturnValue(mockInsertChain as any);

      // Act & Assert
      await expect(service.create(null as any)).rejects.toThrow();
    });

    it('should handle invalid date formats', async () => {
      // Arrange
      const invalidDate = new Date('invalid-date');
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      mockDb.selectDistinct.mockReturnValue(mockSelectChain as any);

      // Act
      const result = await service.findByAvailability(invalidDate);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle connection timeout', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockRejectedValue(new Error('Connection timeout')),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act & Assert
      await expect(service.findAll()).rejects.toThrow('Connection timeout');
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

    it('should handle concurrent operations', async () => {
      // Arrange
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockBarber]),
      };
      mockDb.select.mockReturnValue(mockSelectChain as any);

      // Act
      const promises = [
        service.findOne(1),
        service.findOne(1),
        service.findOne(1),
      ];
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toEqual(mockBarber);
      });
    });
  });
});
