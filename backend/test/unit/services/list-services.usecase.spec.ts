import { ListServicesUseCase } from '../../../src/modules/services/application/list-services.usecase';
import type { ServicesRepositoryPort } from '../../../src/modules/services/domain/service.repository';

describe('ListServicesUseCase', () => {
  let usecase: ListServicesUseCase;
  let repo: jest.Mocked<ServicesRepositoryPort>;

  beforeEach(() => {
    repo = {
      listActive: jest.fn(),
      list: jest.fn(),
    } as any;
    usecase = new ListServicesUseCase(
      repo as unknown as ServicesRepositoryPort
    );
  });

  it('defaults to active=true, limit=20, offset=0', async () => {
    repo.list.mockResolvedValueOnce([]);
    await usecase.execute({});
    expect(repo.list).toHaveBeenCalledWith({
      active: true,
      category: undefined,
      search: undefined,
      limit: 20,
      offset: 0,
    });
  });

  it('passes through filters and pagination', async () => {
    const result = [
      {
        id: 1,
        name: 'Classic Cut',
        description: 'Precision',
        priceCents: 3000,
        durationMinutes: 30,
        category: 'haircut',
        isActive: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    repo.list.mockResolvedValueOnce(result as any);

    const out = await usecase.execute({
      category: 'haircut',
      search: 'cut',
      active: false,
      limit: 5,
      offset: 10,
    });
    expect(repo.list).toHaveBeenCalledWith({
      category: 'haircut',
      search: 'cut',
      active: false,
      limit: 5,
      offset: 10,
    });
    expect(out).toBe(result);
  });
});
