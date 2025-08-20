import { INestApplication, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { SERVICES_REPOSITORY } from '../../src/modules/services/domain/service.repository';

describe('Services (e2e)', () => {
  let app: INestApplication;
  const repoMock: any = {
    list: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SERVICES_REPOSITORY)
      .useValue(repoMock)
      .compile();

    app = moduleFixture.createNestApplication();
    // Align with production bootstrap
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/services returns filtered, paginated list', async () => {
    (repoMock.list as jest.Mock).mockResolvedValueOnce([
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
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/v1/services')
      .query({
        category: 'haircut',
        search: 'cut',
        active: true,
        limit: 1,
        offset: 0,
      })
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Classic Cut');
    expect(repoMock.list).toHaveBeenCalledWith({
      category: 'haircut',
      search: 'cut',
      active: true,
      limit: 1,
      offset: 0,
    });
  });
});
