import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { PrismaService } from '../prisma.service';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '../../generated/prisma/client';

describe('CollectionController', () => {
  let controller: CollectionController;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionController],
      providers: [
        CollectionService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<CollectionController>(CollectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const mockRequest = { user: { sub: 'user-1' } };

  describe('create', () => {
    it('should call service.create with dto and user id', async () => {
      const dto = { name: 'My Collection' };
      const created = { id: 'c1', name: 'My Collection', userId: 'user-1' };
      jest
        .spyOn(controller['collectionService'], 'create')
        .mockResolvedValue(created as never);

      await controller.create(dto, mockRequest as never);

      expect(controller['collectionService'].create).toHaveBeenCalledWith(
        dto,
        'user-1',
      );
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with user id and query', async () => {
      const result = { data: [], meta: { total: 0, page: 1, limit: 20 } };
      jest
        .spyOn(controller['collectionService'], 'findAll')
        .mockResolvedValue(result as never);

      await controller.findAll(mockRequest as never, { page: 2, limit: 10 });

      expect(controller['collectionService'].findAll).toHaveBeenCalledWith(
        'user-1',
        2,
        10,
        undefined,
      );
    });

    it('should pass optional name filter', async () => {
      jest
        .spyOn(controller['collectionService'], 'findAll')
        .mockResolvedValue({ data: [], meta: {} } as never);

      await controller.findAll(mockRequest as never, { name: 'cards' });

      expect(controller['collectionService'].findAll).toHaveBeenCalledWith(
        'user-1',
        1,
        20,
        'cards',
      );
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id and user id', async () => {
      const collection = { id: 'c1', name: 'C', userId: 'user-1' };
      jest
        .spyOn(controller['collectionService'], 'findOne')
        .mockResolvedValue(collection as never);

      const result = await controller.findOne('c1', mockRequest as never);

      expect(controller['collectionService'].findOne).toHaveBeenCalledWith(
        'c1',
        'user-1',
      );
      expect(result).toEqual(collection);
    });
  });

  describe('update', () => {
    it('should call service.update with id, user id and dto', async () => {
      const dto = { name: 'Updated' };
      const updated = { id: 'c1', name: 'Updated', userId: 'user-1' };
      jest
        .spyOn(controller['collectionService'], 'update')
        .mockResolvedValue(updated as never);

      await controller.update('c1', dto, mockRequest as never);

      expect(controller['collectionService'].update).toHaveBeenCalledWith(
        'c1',
        'user-1',
        dto,
      );
    });
  });

  describe('remove', () => {
    it('should call service.remove with id and user id', async () => {
      jest
        .spyOn(controller['collectionService'], 'remove')
        .mockResolvedValue(undefined as never);

      await controller.remove('c1', mockRequest as never);

      expect(controller['collectionService'].remove).toHaveBeenCalledWith(
        'c1',
        'user-1',
      );
    });
  });
});
