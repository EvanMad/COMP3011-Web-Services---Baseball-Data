import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { PrismaService } from '../prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Collection, PrismaClient } from '../../generated/prisma/client';
import { UpdateCollectionDto } from './dto/update-collection.dto';

const mockCollection = (overrides: Partial<Collection> = {}): Collection =>
  ({
    id: 'col-1',
    name: 'Test Collection',
    description: 'Description',
    playerIDs: ['p1', 'p2'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    userId: 'user-1',
    ...overrides,
  }) as Collection;

describe('CollectionService', () => {
  let service: CollectionService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CollectionService>(CollectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a collection for the user', async () => {
      const created = mockCollection();
      prismaMock.collection.create.mockResolvedValue(created);

      const result = await service.create(
        { name: 'Test Collection', description: 'Desc', playerIDs: ['p1'] },
        'user-1',
      );

      expect(prismaMock.collection.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Collection',
          description: 'Desc',
          playerIDs: ['p1'],
          userId: 'user-1',
        },
      });
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return paginated collections for user', async () => {
      const collections = [mockCollection(), mockCollection({ id: 'col-2' })];
      prismaMock.collection.findMany.mockResolvedValue(collections);
      prismaMock.collection.count.mockResolvedValue(2);

      const result = await service.findAll('user-1');

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(prismaMock.collection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          skip: 0,
          take: 20,
          orderBy: { updatedAt: 'desc' },
        }),
      );
    });

    it('should filter by name when provided', async () => {
      prismaMock.collection.findMany.mockResolvedValue([]);
      prismaMock.collection.count.mockResolvedValue(0);

      await service.findAll('user-1', 1, 20, 'My Team');

      expect(prismaMock.collection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 'user-1',
            name: { contains: 'My Team', mode: 'insensitive' },
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return collection when found for user', async () => {
      const collection = mockCollection();
      prismaMock.collection.findFirst.mockResolvedValue(collection);

      const result = await service.findOne('col-1', 'user-1');

      expect(prismaMock.collection.findFirst).toHaveBeenCalledWith({
        where: { id: 'col-1', userId: 'user-1' },
      });
      expect(result).toEqual(collection);
    });

    it('should throw NotFoundException when collection not found', async () => {
      prismaMock.collection.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('missing', 'user-1')).rejects.toThrow(
        'Collection not found',
      );
    });
  });

  describe('update', () => {
    it('should update collection when found', async () => {
      const existing = mockCollection();
      const updated = mockCollection({
        name: 'Updated Name',
        updatedAt: new Date('2024-01-03'),
      });
      const dto: UpdateCollectionDto = { name: 'Updated Name' };

      prismaMock.collection.findFirst.mockResolvedValue(existing);
      prismaMock.collection.update.mockResolvedValue(updated);

      const result = await service.update('col-1', 'user-1', dto);

      expect(prismaMock.collection.update).toHaveBeenCalledWith({
        where: { id: 'col-1' },
        data: dto,
      });
      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when collection not found', async () => {
      prismaMock.collection.findFirst.mockResolvedValue(null);

      await expect(
        service.update('missing', 'user-1', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.collection.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete collection when found', async () => {
      prismaMock.collection.findFirst.mockResolvedValue(mockCollection());
      prismaMock.collection.delete.mockResolvedValue(mockCollection());

      await service.remove('col-1', 'user-1');

      expect(prismaMock.collection.delete).toHaveBeenCalledWith({
        where: { id: 'col-1' },
      });
    });

    it('should throw NotFoundException when collection not found', async () => {
      prismaMock.collection.findFirst.mockResolvedValue(null);

      await expect(service.remove('missing', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.collection.delete).not.toHaveBeenCalled();
    });
  });
});
