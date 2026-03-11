import request from 'supertest';
import type { App } from 'supertest/types';
import { Test } from '@nestjs/testing';
import {
  INestApplication,
  ExecutionContext,
} from '@nestjs/common';
import { CollectionModule } from '../../src/collection/collection.module';
import { CollectionService } from '../../src/collection/collection.service';
import { AuthGuard } from '../../src/auth/auth.guard';

interface CollectionListResponse {
  data: unknown;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

const mockPrismaService = {
  collection: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('../prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => mockPrismaService),
}));

const mockAuthGuard = {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.user = { sub: 'e2e-test-user', username: 'e2e', role: 'user' };
    return true;
  },
};

describe('CollectionController (e2e)', () => {
  let app: INestApplication | undefined;
  const collectionService = {
    findAll: () => ({
      data: ['test'],
      meta: {
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CollectionModule],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideProvider(CollectionService)
      .useValue(collectionService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET collection (paginated)`, () => {
    return request(app!.getHttpServer() as App)
      .get('/collection')
      .expect(200)
      .expect((res) => {
        const body = res.body as CollectionListResponse;
        expect(body).toHaveProperty('data');
        expect(body).toHaveProperty('meta');
        expect(body.meta).toMatchObject({
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        });
      });
  });

  afterAll(async () => {
    if (app) await app.close();
  });
});
