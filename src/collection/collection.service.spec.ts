import { Test, TestingModule } from '@nestjs/testing';
import { CollectionService } from './collection.service';
import { PrismaService } from '../prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';

const mockPrismaService = {
  collection: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

// Mock PrismaService so the real one (and generated Prisma client) is never loaded
jest.mock('../prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => mockPrismaService),
}));

describe('CollectionService', () => {
  let service: CollectionService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CollectionService>(CollectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a collection', async () => {
    const createDto: CreateCollectionDto = {
      name: 'My Collection',
      description: 'A collection of my favorite cards',
      playerIDs: ['player-1'],
    };
    const created = {
      id: 'collection-1',
      name: createDto.name,
      description: createDto.description,
      userId: 'test-user-id',
      playerIDs: createDto.playerIDs,
    };
    mockPrismaService.collection.create.mockResolvedValue(created);

    const collection = await service.create(createDto, 'test-user-id');
    expect(collection).toHaveProperty('id');
    expect(collection.name).toBe(createDto.name);
    expect(collection.description).toBe(createDto.description);
    expect(mockPrismaService.collection.create).toHaveBeenCalledWith({
      data: { ...createDto, userId: 'test-user-id' },
    });
  });

  it('should fail to create a collection with invalid data', async () => {
    const createDto: CreateCollectionDto = {
      name: '',
      description: 'A collection of my favorite cards',
      playerIDs: ['player-1'],
    };

    await expect(service.create(createDto, 'test-user-id')).rejects.toThrow();
    expect(mockPrismaService.collection.create).not.toHaveBeenCalled();
  });

  it('should find all collections for a user', async () => {
    const collections = [
      { id: 'collection-1', name: 'Collection 1', userId: 'test-user-id' },
      { id: 'collection-2', name: 'Collection 2', userId: 'test-user-id' },
    ];
    mockPrismaService.collection.findMany.mockResolvedValue(collections);

    const result = await service.findAll('test-user-id');
    expect(result).toEqual(collections);
    expect(mockPrismaService.collection.findMany).toHaveBeenCalledWith({
      where: { userId: 'test-user-id' },
    });
  });

  it('should find a collection by id', async () => {
    const collection = {
      id: 'collection-1',
      name: 'Collection 1',
      userId: 'test-user-id',
    };
    mockPrismaService.collection.findFirst.mockResolvedValue(collection);

    const result = await service.findOne('collection-1', 'test-user-id');
    expect(result).toEqual(collection);
    expect(mockPrismaService.collection.findFirst).toHaveBeenCalledWith({
      where: { id: 'collection-1', userId: 'test-user-id' },
    });
  });
});
