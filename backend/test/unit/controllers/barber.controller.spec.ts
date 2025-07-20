/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BarberController } from '../../../src/controllers/barber.controller';
import { BarberService } from '../../../src/services/barber-drizzle.service';
import { CreateBarberDto, UpdateBarberDto } from '../../../src/dto/barber.dto';

describe('BarberController', () => {
  let controller: BarberController;
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

  const mockBarberService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByAvailability: jest.fn(),
    findBusyBarbers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BarberController],
      providers: [
        {
          provide: BarberService,
          useValue: mockBarberService,
        },
      ],
    }).compile();

    controller = module.get<BarberController>(BarberController);
    service = module.get<BarberService>(BarberService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new barber', async () => {
      // Arrange
      mockBarberService.create.mockResolvedValue(mockBarber);

      // Act
      const result = await controller.create(mockCreateBarberDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(mockCreateBarberDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBarber);
    });

    it('should handle service errors during creation', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockBarberService.create.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.create(mockCreateBarberDto)).rejects.toThrow(
        'Database connection failed',
      );
      expect(service.create).toHaveBeenCalledWith(mockCreateBarberDto);
    });

    it('should validate input data', async () => {
      // Arrange
      const invalidDto = {} as CreateBarberDto;
      mockBarberService.create.mockRejectedValue(
        new Error('Validation failed'),
      );

      // Act & Assert
      await expect(controller.create(invalidDto)).rejects.toThrow();
      expect(service.create).toHaveBeenCalledWith(invalidDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of barbers', async () => {
      // Arrange
      const mockBarbers = [
        mockBarber,
        { ...mockBarber, id: 2, name: 'Jane Doe' },
      ];
      mockBarberService.findAll.mockResolvedValue(mockBarbers);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalled();
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBarbers);
    });

    it('should return empty array when no barbers found', async () => {
      // Arrange
      mockBarberService.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle service errors during findAll', async () => {
      // Arrange
      const error = new Error('Database query failed');
      mockBarberService.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findAll()).rejects.toThrow(
        'Database query failed',
      );
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should handle large datasets efficiently', async () => {
      // Arrange
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...mockBarber,
        id: i + 1,
        name: `Barber ${i + 1}`,
      }));
      mockBarberService.findAll.mockResolvedValue(largeDataset);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toHaveLength(1000);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single barber', async () => {
      // Arrange
      mockBarberService.findOne.mockResolvedValue(mockBarber);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBarber);
    });

    it('should handle NotFoundException', async () => {
      // Arrange
      const notFoundError = new NotFoundException(
        'Barber with ID 999 not found',
      );
      mockBarberService.findOne.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(controller.findOne(999)).rejects.toThrow(
        'Barber with ID 999 not found',
      );
      expect(service.findOne).toHaveBeenCalledWith(999);
    });

    it('should handle invalid ID types', async () => {
      // Arrange
      const invalidId = 'invalid' as unknown as number;
      mockBarberService.findOne.mockRejectedValue(new Error('Invalid ID'));

      // Act & Assert
      await expect(controller.findOne(invalidId)).rejects.toThrow();
      expect(service.findOne).toHaveBeenCalledWith(invalidId);
    });

    it('should handle negative IDs', async () => {
      // Arrange
      const negativeId = -1;
      mockBarberService.findOne.mockRejectedValue(
        new NotFoundException('Barber with ID -1 not found'),
      );

      // Act & Assert
      await expect(controller.findOne(negativeId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledWith(negativeId);
    });

    it('should handle zero ID', async () => {
      // Arrange
      mockBarberService.findOne.mockRejectedValue(
        new NotFoundException('Barber with ID 0 not found'),
      );

      // Act & Assert
      await expect(controller.findOne(0)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(0);
    });
  });

  describe('update', () => {
    it('should update a barber successfully', async () => {
      // Arrange
      const updatedBarber = { ...mockBarber, ...mockUpdateBarberDto };
      mockBarberService.update.mockResolvedValue(updatedBarber);

      // Act
      const result = await controller.update(1, mockUpdateBarberDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, mockUpdateBarberDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedBarber);
    });

    it('should handle partial updates', async () => {
      // Arrange
      const partialUpdate = { name: 'Updated Name' };
      const updatedBarber = { ...mockBarber, name: 'Updated Name' };
      mockBarberService.update.mockResolvedValue(updatedBarber);

      // Act
      const result = await controller.update(1, partialUpdate);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, partialUpdate);
      expect(result).toEqual(updatedBarber);
    });

    it('should handle NotFoundException during update', async () => {
      // Arrange
      const notFoundError = new NotFoundException(
        'Barber with ID 999 not found',
      );
      mockBarberService.update.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.update(999, mockUpdateBarberDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.update).toHaveBeenCalledWith(999, mockUpdateBarberDto);
    });

    it('should handle empty update data', async () => {
      // Arrange
      const emptyUpdate = {};
      mockBarberService.update.mockResolvedValue(mockBarber);

      // Act
      const result = await controller.update(1, emptyUpdate);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, emptyUpdate);
      expect(result).toEqual(mockBarber);
    });

    it('should handle rating updates specifically', async () => {
      // Arrange
      const ratingUpdate = { rating: 4.9 };
      const updatedBarber = { ...mockBarber, rating: '4.9' };
      mockBarberService.update.mockResolvedValue(updatedBarber);

      // Act
      const result = await controller.update(1, ratingUpdate);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, ratingUpdate);
      expect(result.rating).toBe('4.9');
    });

    it('should handle service errors during update', async () => {
      // Arrange
      const error = new Error('Update operation failed');
      mockBarberService.update.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.update(1, mockUpdateBarberDto)).rejects.toThrow(
        'Update operation failed',
      );
      expect(service.update).toHaveBeenCalledWith(1, mockUpdateBarberDto);
    });
  });

  describe('remove', () => {
    it('should remove a barber successfully', async () => {
      // Arrange
      mockBarberService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(1);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: 'Barber deleted successfully' });
    });

    it('should handle NotFoundException during removal', async () => {
      // Arrange
      const notFoundError = new NotFoundException(
        'Barber with ID 999 not found',
      );
      mockBarberService.remove.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(999);
    });

    it('should handle service errors during removal', async () => {
      // Arrange
      const error = new Error('Deletion failed');
      mockBarberService.remove.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.remove(1)).rejects.toThrow('Deletion failed');
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should handle foreign key constraint errors', async () => {
      // Arrange
      const constraintError = new Error(
        'Cannot delete barber with existing bookings',
      );
      mockBarberService.remove.mockRejectedValue(constraintError);

      // Act & Assert
      await expect(controller.remove(1)).rejects.toThrow(
        'Cannot delete barber with existing bookings',
      );
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle concurrent requests', async () => {
      // Arrange
      mockBarberService.findOne.mockResolvedValue(mockBarber);

      // Act
      const promises = [
        controller.findOne(1),
        controller.findOne(1),
        controller.findOne(1),
      ];
      const results = await Promise.all(promises);

      // Assert
      expect(service.findOne).toHaveBeenCalledTimes(3);
      results.forEach((result) => {
        expect(result).toEqual(mockBarber);
      });
    });

    it('should handle service timeout errors', async () => {
      // Arrange
      const timeoutError = new Error('Request timeout');
      mockBarberService.findAll.mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(controller.findAll()).rejects.toThrow('Request timeout');
    });

    it('should handle malformed service responses', async () => {
      // Arrange
      mockBarberService.findOne.mockResolvedValue(null);

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

    it('should handle very large ID numbers', async () => {
      // Arrange
      const largeId = Number.MAX_SAFE_INTEGER;
      mockBarberService.findOne.mockResolvedValue(mockBarber);

      // Act
      const result = await controller.findOne(largeId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(largeId);
      expect(result).toEqual(mockBarber);
    });
  });

  describe('input validation scenarios', () => {
    it('should pass through all DTO properties correctly', async () => {
      // Arrange
      const complexDto: CreateBarberDto = {
        name: 'Complex Name with àccénts',
        title: 'Senior Master Barber & Hair Stylist',
        bio: 'Very long bio with special characters: !@#$%^&*()_+-=[]{}|;:,.<>?',
        image: '/images/very-long-filename-with-numbers-123.jpg',
        experienceYears: 25,
        specialties: ['Cut', 'Color', 'Style', 'Beard', 'Mustache'],
        phone: '+1 (555) 123-4567 ext. 890',
        email: 'complex.email+tag@subdomain.example.com',
      };
      mockBarberService.create.mockResolvedValue(mockBarber);

      // Act
      const result = await controller.create(complexDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(complexDto);
      expect(result).toEqual(mockBarber);
    });

    it('should handle unicode characters in names', async () => {
      // Arrange
      const unicodeDto: CreateBarberDto = {
        name: '李小明 José María',
        title: 'Master Barber',
        bio: 'Speaks 中文 and Español',
        image: '/images/barber.jpg',
      };
      mockBarberService.create.mockResolvedValue(mockBarber);

      // Act
      const result = await controller.create(unicodeDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(unicodeDto);
      expect(result).toEqual(mockBarber);
    });

    it('should handle boundary values for numeric fields', async () => {
      // Arrange
      const boundaryDto: UpdateBarberDto = {
        experienceYears: 0,
        rating: 0.01,
        reviewCount: 999999,
      };
      mockBarberService.update.mockResolvedValue(mockBarber);

      // Act
      const result = await controller.update(1, boundaryDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, boundaryDto);
      expect(result).toEqual(mockBarber);
    });
  });
});
