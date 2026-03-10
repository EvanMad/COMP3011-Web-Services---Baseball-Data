import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { PrismaService } from '../prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
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
});
