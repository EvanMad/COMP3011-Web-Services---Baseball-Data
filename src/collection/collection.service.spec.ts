import { Test, TestingModule } from '@nestjs/testing';
import { CollectionService } from './collection.service';
import { PrismaService } from '../prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '../../generated/prisma/client';

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
    const mockCollection = {
      id: '1',
      name: 'Test Collection',
      userID: 'user123',
    };

    // Setup the mock behavior
    prismaMock.collection.create.mockResolvedValue(mockCollection);

    const result = await service.create(
      { name: 'Test Collection', playerIDs: [] },
      'user123',
    );

    expect(result).toEqual(mockCollection);
    expect(prismaMock.collection.create).toHaveBeenCalledWith({
      data: {
        name: 'Test Collection',
        userID: 'user123',
        playerIDs: []
      },
    });
  });
});
