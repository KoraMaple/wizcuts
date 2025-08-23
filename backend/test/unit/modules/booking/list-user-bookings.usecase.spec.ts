import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { ListUserBookingsUseCase } from '../../../../src/modules/booking/application/list-user-bookings.usecase';
import {
  BOOKINGS_REPOSITORY,
  BookingsRepositoryPort,
} from '../../../../src/modules/booking/domain/booking.repository';
import { Booking } from '../../../../src/modules/booking/domain/booking.entity';

describe('ListUserBookingsUseCase', () => {
  let usecase: ListUserBookingsUseCase;
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
        ListUserBookingsUseCase,
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

    usecase = moduleRef.get(ListUserBookingsUseCase);
    repo = moduleRef.get(BOOKINGS_REPOSITORY);
  });

  it('returns user bookings from repository', async () => {
    repo.listByUser.mockResolvedValue([sample]);
    const result = await usecase.execute('user123');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(sample);
    expect(repo.listByUser).toHaveBeenCalledWith('user123');
  });

  it('returns empty array when user has no bookings', async () => {
    repo.listByUser.mockResolvedValue([]);
    const result = await usecase.execute('user456');
    expect(result).toHaveLength(0);
    expect(repo.listByUser).toHaveBeenCalledWith('user456');
  });
});
