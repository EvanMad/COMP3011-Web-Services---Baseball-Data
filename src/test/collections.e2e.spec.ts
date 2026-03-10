import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { CollectionModule } from '../../src/collection/collection.module';
import { CollectionService } from '../../src/collection/collection.service';

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

describe('CollectionController (e2e)', () => {
  let app: INestApplication;
  const collectionService = { findAll: () => ['test'] };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CollectionModule],
    })
      .overrideProvider(CollectionService)
      .useValue(collectionService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET cats`, () => {
    return request(app.getHttpServer()).get('/collection').expect(200).expect({
      data: collectionService.findAll(),
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
