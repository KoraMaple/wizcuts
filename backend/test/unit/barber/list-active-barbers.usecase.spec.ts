import 'jest';
import { Test } from '@nestjs/testing';
import { ListActiveBarbersUseCase } from '../../../src/modules/barber/application/list-active-barbers.usecase';
import {
  BARBERS_REPOSITORY,
  type BarbersRepositoryPort,
} from '../../../src/modules/barber/domain/barber.repository';
import type { BarberEntity } from '../../../src/modules/barber/domain/barber.entity';

describe('ListActiveBarbersUseCase', () => {
  it('returns active barbers from repository', async () => {
    const barbers: BarberEntity[] = [
      {
        id: 1,
        name: 'John',
        title: 'Master Barber',
        bio: null,
        image: null,
        experienceYears: 10,
        specialties: ['Classic'],
        rating: '4.5',
        reviewCount: 20,
        isActive: true,
        phone: null,
        email: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];

    const moduleRef = await Test.createTestingModule({
      providers: [
        ListActiveBarbersUseCase,
        {
          provide: BARBERS_REPOSITORY,
          useValue: {
            listActive: jest.fn().mockResolvedValue(barbers),
          } as Partial<BarbersRepositoryPort>,
        },
      ],
    }).compile();

    const usecase = moduleRef.get(ListActiveBarbersUseCase);

    await expect(usecase.execute()).resolves.toEqual(barbers);
  });
});
