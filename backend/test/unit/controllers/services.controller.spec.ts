import { Test } from '@nestjs/testing';
import { ServicesController } from '../../../src/modules/services/interface/services.controller';
import { ListServicesUseCase } from '../../../src/modules/services/application/list-services.usecase';
import type { ServicesQueryDto } from '../../../src/modules/services/interface/dto/services-query.dto';

describe('ServicesController', () => {
  let controller: ServicesController;
  let usecase: { execute: jest.Mock };

  beforeEach(async () => {
    usecase = { execute: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ListServicesUseCase,
          useValue: usecase,
        },
      ],
    }).compile();

    controller = moduleRef.get(ServicesController);
  });

  it('delegates to use case with query dto and returns DTO-mapped result', async () => {
    const domainItems = [
      {
        id: 1,
        name: 'Classic Cut',
        description: 'Precision',
        priceCents: 3000,
        durationMinutes: 30,
        category: 'haircut',
        isActive: true,
        image: null,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      },
    ];
    usecase.execute.mockResolvedValueOnce(domainItems);

    const query: Partial<ServicesQueryDto> = {
      category: 'haircut',
      limit: 10,
      offset: 0,
    };
    const result = await controller.list(query as ServicesQueryDto);

    expect(usecase.execute).toHaveBeenCalledWith(query);
    expect(result).toEqual([
      {
        id: 1,
        name: 'Classic Cut',
        description: 'Precision',
        basePrice: '30.00',
        durationMinutes: 30,
        category: 'haircut',
        isActive: true,
        image: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      },
    ]);
  });
});
