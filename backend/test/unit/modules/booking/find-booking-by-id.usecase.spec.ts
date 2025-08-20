import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindBookingByIdUseCase } from '../../../../src/modules/booking/application/find-booking-by-id.usecase';
import {
  BOOKINGS_REPOSITORY,
  BookingsRepositoryPort,
} from '../../../../src/modules/booking/domain/booking.repository';
import { Booking } from '../../../../src/modules/booking/domain/booking.entity';

describe('FindBookingByIdUseCase', () => {
  let usecase: FindBookingByIdUseCase;
  let repo: jest.Mocked<BookingsRepositoryPort>;

  const now = new Date();
  const sample: Booking = {
    id: 1,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    serviceId: 10,
    barberId: 5,
    startTime: now,
    endTime: new Date(now.getTime() + 30 * 60000),
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        FindBookingByIdUseCase,
        {
          provide: BOOKINGS_REPOSITORY,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            confirm: jest.fn(),
            cancel: jest.fn(),
            findById: jest.fn(),
            list: jest.fn(),
            listByUser: jest.fn(),
          } as jest.Mocked<BookingsRepositoryPort>,
        },
      ],
    }).compile();

    usecase = moduleRef.get(FindBookingByIdUseCase);
    repo = moduleRef.get(BOOKINGS_REPOSITORY);
  });

  it('returns booking when found', async () => {
    repo.findById.mockResolvedValue(sample);
    const result = await usecase.execute(1);
    expect(result).toEqual(sample);
    expect(repo.findById).toHaveBeenCalledWith(1);
  });

  it('throws NotFoundException when booking not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(usecase.execute(999)).rejects.toThrow(NotFoundException);
    await expect(usecase.execute(999)).rejects.toThrow(
      'Booking with ID 999 not found'
    );
    expect(repo.findById).toHaveBeenCalledWith(999);
  });
});
