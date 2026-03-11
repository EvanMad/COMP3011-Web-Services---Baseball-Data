import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PrismaService } from '../prisma.service';
import { StatsService } from '../stats/stats.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Player, PrismaClient } from '../../generated/prisma/client';
import { CreatePlayerDto } from './dto/player-response/create-player.dto';
import { UpdatePlayerDto } from './dto/player-response/update-player.dto';

const mockPlayer = (overrides: Partial<Player> = {}): Player =>
  ({
    id: 1,
    playerID: 'test-001',
    nameFirst: 'Joe',
    nameLast: 'Bloggs',
    dateOfBirth: null,
    dateOfDeath: null,
    birthCountry: 'USA',
    weight: 180,
    height: 72,
    bats: 'R',
    throws: 'R',
    collectionId: null,
    ...overrides,
  }) as Player;

describe('PlayerService', () => {
  let service: PlayerService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        StatsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated players with default page and limit', async () => {
      const players = [mockPlayer({ playerID: 'p1' }), mockPlayer({ playerID: 'p2' })];
      prismaMock.player.findMany.mockResolvedValue(players);
      prismaMock.player.count.mockResolvedValue(2);

      const result = await service.findAll();

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(prismaMock.player.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          orderBy: [{ nameLast: 'asc' }, { nameFirst: 'asc' }],
        }),
      );
    });

    it('should apply name filter when provided', async () => {
      prismaMock.player.findMany.mockResolvedValue([]);
      prismaMock.player.count.mockResolvedValue(0);

      await service.findAll(1, 20, 'smith');

      expect(prismaMock.player.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { nameFirst: { contains: 'smith', mode: 'insensitive' } },
              { nameLast: { contains: 'smith', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should apply birthCountry filter when provided', async () => {
      prismaMock.player.findMany.mockResolvedValue([]);
      prismaMock.player.count.mockResolvedValue(0);

      await service.findAll(1, 20, undefined, 'USA');

      expect(prismaMock.player.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            birthCountry: { equals: 'USA', mode: 'insensitive' },
          },
        }),
      );
    });
  });

  describe('getPlayerById', () => {
    it('should return player with career stats and highs when found', async () => {
      const player = mockPlayer();
      const sum = {
        H: 100,
        AB: 400,
        BB: 50,
        HBP: 2,
        SF: 5,
        DOUBLE: 20,
        TRIPLE: 5,
        HR: 10,
      };
      prismaMock.player.findUnique.mockResolvedValue(player);
      prismaMock.batting.aggregate.mockResolvedValue({
        _sum: sum,
        _avg: null,
        _count: null,
        _min: null,
        _max: null,
      });
      prismaMock.batting.findFirst.mockResolvedValueOnce({ HR: 30 } as never);
      prismaMock.batting.findFirst.mockResolvedValueOnce({ H: 200 } as never);

      const result = await service.getPlayerById('test-001');

      expect(result.playerID).toBe('test-001');
      expect(result.nameFirst).toBe('Joe');
      expect(result.career_batting).toBeDefined();
      expect(result.career_batting?.battingAverage).toBe(0.25);
      expect(result.careerHighs).toEqual({ HR: 30, H: 200 });
    });

    it('should throw NotFoundException when player does not exist', async () => {
      prismaMock.player.findUnique.mockResolvedValue(null);

      await expect(service.getPlayerById('missing')).rejects.toThrow(
        new NotFoundException('Player with id missing not found'),
      );
    });
  });

  describe('createPlayer', () => {
    it('should create a player and return the mapped DTO', async () => {
      const inputDto: CreatePlayerDto = {
        playerID: 'test-001',
        nameFirst: 'Joe',
        nameLast: 'Bloggs',
        weight: 180,
        height: 72,
      };
      const dbResponse = mockPlayer();

      prismaMock.player.findUnique.mockResolvedValue(null);
      prismaMock.player.create.mockResolvedValue(dbResponse);

      const result = await service.createPlayer(inputDto);

      expect(result.playerID).toBe('test-001');
      expect(result.birthCountry).toBe('USA');
    });

    it('should throw ConflictException when player id already exists', async () => {
      const inputDto: CreatePlayerDto = {
        playerID: 'test-001',
        nameFirst: 'Joe',
        nameLast: 'Bloggs',
        weight: 180,
        height: 72,
      };
      prismaMock.player.findUnique.mockResolvedValue(mockPlayer());

      await expect(service.createPlayer(inputDto)).rejects.toThrow(
        `Player with id ${inputDto.playerID} already exists`,
      );
    });
  });

  describe('updatePlayer', () => {
    it('should update and return mapped DTO when player exists', async () => {
      const existing = mockPlayer();
      const updated = mockPlayer({ nameFirst: 'Jane', weight: 170 });
      const dto: UpdatePlayerDto = { nameFirst: 'Jane', weight: 170 };

      prismaMock.player.findUnique.mockResolvedValue(existing);
      prismaMock.player.update.mockResolvedValue(updated);

      const result = await service.updatePlayer('test-001', dto);

      expect(prismaMock.player.update).toHaveBeenCalledWith({
        where: { playerID: 'test-001' },
        data: dto,
      });
      expect(result.nameFirst).toBe('Jane');
      expect(result.weight).toBe(170);
    });

    it('should throw NotFoundException when player does not exist', async () => {
      prismaMock.player.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePlayer('missing', { nameFirst: 'X' }),
      ).rejects.toThrow(new NotFoundException('Player with id missing not found'));
    });
  });

  describe('deletePlayer', () => {
    it('should delete player when found', async () => {
      prismaMock.player.findUnique.mockResolvedValue(mockPlayer());
      prismaMock.player.delete.mockResolvedValue(mockPlayer());

      await service.deletePlayer('test-001');

      expect(prismaMock.player.delete).toHaveBeenCalledWith({
        where: { playerID: 'test-001' },
      });
    });

    it('should throw NotFoundException when player does not exist', async () => {
      prismaMock.player.findUnique.mockResolvedValue(null);

      await expect(service.deletePlayer('non-existent-id')).rejects.toThrow(
        'Player with id non-existent-id not found',
      );
    });
  });
});
