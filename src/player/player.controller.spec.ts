import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { PrismaService } from '../prisma.service';
import { StatsService } from '../stats/stats.service';
import { UsersService } from '../users/users.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '../../generated/prisma/client';

describe('PlayerController', () => {
  let controller: PlayerController;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [
        PlayerService,
        StatsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<PlayerController>(PlayerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
