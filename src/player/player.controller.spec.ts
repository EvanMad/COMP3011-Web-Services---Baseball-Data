import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { PrismaService } from '../prisma.service';
import { StatsService } from '../stats/stats.service';
import { UsersService } from '../users/users.service';
import { mockDeep } from 'jest-mock-extended';
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

  describe('getPlayerById', () => {
    it('should return player from service', async () => {
      const player = {
        playerID: 'p1',
        nameFirst: 'Joe',
        nameLast: 'Bloggs',
        career_batting: null,
        careerHighs: { HR: 0, H: 0 },
      };
      jest
        .spyOn(controller['playerService'], 'getPlayerById')
        .mockResolvedValue(player as never);

      const result = await controller.getPlayerById('p1');

      expect(controller['playerService'].getPlayerById).toHaveBeenCalledWith(
        'p1',
      );
      expect(result).toEqual(player);
    });
  });

  describe('getAllPlayers', () => {
    it('should call service.findAll with query params', async () => {
      const paginated = { data: [], meta: { total: 0, page: 1, limit: 20 } };
      jest
        .spyOn(controller['playerService'], 'findAll')
        .mockResolvedValue(paginated as never);

      const result = await controller.getAllPlayers({
        page: 2,
        limit: 10,
        name: 'smith',
        birthCountry: 'USA',
      });

      expect(controller['playerService'].findAll).toHaveBeenCalledWith(
        2,
        10,
        'smith',
        'USA',
      );
      expect(result).toEqual(paginated);
    });
  });

  describe('updatePlayer', () => {
    it('should call service.updatePlayer with id and dto', async () => {
      const updated = { playerID: 'p1', nameFirst: 'Jane', nameLast: 'Doe' };
      jest
        .spyOn(controller['playerService'], 'updatePlayer')
        .mockResolvedValue(updated as never);

      const result = await controller.updatePlayer('p1', { nameFirst: 'Jane' });

      expect(controller['playerService'].updatePlayer).toHaveBeenCalledWith(
        'p1',
        {
          nameFirst: 'Jane',
        },
      );
      expect(result).toEqual(updated);
    });
  });

  describe('deletePlayer', () => {
    it('should call service.deletePlayer', async () => {
      jest
        .spyOn(controller['playerService'], 'deletePlayer')
        .mockResolvedValue(undefined as never);

      await controller.deletePlayer('p1');

      expect(controller['playerService'].deletePlayer).toHaveBeenCalledWith(
        'p1',
      );
    });
  });

  describe('createPlayer', () => {
    it('should call service.createPlayer with dto', async () => {
      const dto = {
        playerID: 'new-1',
        nameFirst: 'New',
        nameLast: 'Player',
        weight: 180,
        height: 72,
      };
      const created = {
        playerID: 'new-1',
        nameFirst: 'New',
        nameLast: 'Player',
      };
      jest
        .spyOn(controller['playerService'], 'createPlayer')
        .mockResolvedValue(created as never);

      const result = await controller.createPlayer(dto);

      expect(controller['playerService'].createPlayer).toHaveBeenCalledWith(
        dto,
      );
      expect(result).toEqual(created);
    });
  });
});
