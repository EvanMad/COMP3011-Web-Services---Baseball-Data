import { Test, TestingModule } from '@nestjs/testing';
import { CollectionService } from './collection.service';
import { PrismaService } from '../prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Collection, PrismaClient } from '../../generated/prisma/client';

describe('CollectionService', () => {
  let service: CollectionService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    // 1. Create a deep mock of the Prisma Client
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionService,
        {
          provide: PrismaService,
          useValue: prismaMock, // Use the mock instead of the real service
        },
      ],
    }).compile();

    service = module.get<CollectionService>(CollectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a collection', async () => {
    const mockCollection: Collection = {
      id: '1',
      name: 'Test Collection',
      userId: 'user123',
      playerIDs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      description: 'A test collection',
    };

    // Setup the mock behavior
    prismaMock.collection.create.mockResolvedValue(mockCollection);

    const result = await service.create(
      { name: 'Test Collection', playerIDs: [] },
      'user123',
    );

    expect(result).toEqual(mockCollection);
  });
});
