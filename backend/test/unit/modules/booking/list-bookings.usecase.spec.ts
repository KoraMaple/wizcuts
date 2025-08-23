import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { ListBookingsUseCase } from '../../../../src/modules/booking/application/list-bookings.usecase';
import {
  BOOKINGS_REPOSITORY,
  BookingsRepositoryPort,
} from '../../../../src/modules/booking/domain/booking.repository';
import { Booking } from '../../../../src/modules/booking/domain/booking.entity';

describe('ListBookingsUseCase', () => {
  let usecase: ListBookingsUseCase;
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
        ListBookingsUseCase,
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

    usecase = moduleRef.get(ListBookingsUseCase);
    repo = moduleRef.get(BOOKINGS_REPOSITORY);
  });

  it('returns bookings from repository', async () => {
    repo.list.mockResolvedValue([sample]);
    const result = await usecase.execute({});
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(sample);
    expect(repo.list).toHaveBeenCalledWith({});
  });

  it('forwards query to repository', async () => {
    repo.list.mockResolvedValue([]);
    const query = {
      barberId: 5,
      status: 'confirmed',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
    } as any;
    await usecase.execute(query);
    expect(repo.list).toHaveBeenCalledWith(query);
  });
});
