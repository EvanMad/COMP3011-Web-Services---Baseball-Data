import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MatchService, LINEUP_SIZE } from './match.service';
import { PrismaService } from '../prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '../../generated/prisma/client';
import { CreateMatchDto } from './dto/create-match.dto';

const collectionAId = 'col-a';
const collectionBId = 'col-b';
const userId = 'user-1';

const ninePlayerIdsA = Array.from(
  { length: LINEUP_SIZE },
  (_, i) => `player-a${i}`,
);
const ninePlayerIdsB = Array.from(
  { length: LINEUP_SIZE },
  (_, i) => `player-b${i}`,
);

const mockCollectionA = {
  id: collectionAId,
  name: 'Lineup A',
  description: null,
  playerIDs: ninePlayerIdsA,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId,
};

const mockCollectionB = {
  id: collectionBId,
  name: 'Lineup B',
  description: null,
  playerIDs: ninePlayerIdsB,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId,
};

/** Batting rows that yield a high offensive score (for lineup A). */
const strongBattingRows = ninePlayerIdsA.map((playerID) => ({
  playerID,
  R: 80,
  RBI: 80,
  HR: 25,
  H: 150,
  BB: 60,
}));

/** Pitching rows that yield a strong (high) pitching score for lineup A. */
const strongPitchingRows = ninePlayerIdsA.map((playerID) => ({
  playerID,
  SO: 150,
  W: 12,
  L: 8,
  ERA: 3.2,
}));

/** Batting rows that yield a low offensive score (for lineup B). */
const weakBattingRows = ninePlayerIdsB.map((playerID) => ({
  playerID,
  R: 20,
  RBI: 20,
  HR: 2,
  H: 40,
  BB: 10,
}));

/** Pitching rows that yield a weak pitching score for lineup B. */
const weakPitchingRows = ninePlayerIdsB.map((playerID) => ({
  playerID,
  SO: 30,
  W: 2,
  L: 6,
  ERA: 5.5,
}));

describe('MatchService', () => {
  let service: MatchService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException when collectionAId equals collectionBId', async () => {
      const dto: CreateMatchDto = {
        collectionAId: 'same',
        collectionBId: 'same',
      };

      await expect(service.create(dto, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(dto, userId)).rejects.toThrow(
        'Collection A and Collection B must be different',
      );
      expect(prismaMock.collection.findFirst).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when collection A is not found', async () => {
      prismaMock.collection.findFirst.mockImplementation(
        (args: { where: { id: string } }) =>
          Promise.resolve(
            args.where.id === collectionBId ? (mockCollectionB as never) : null,
          ),
      );

      const dto: CreateMatchDto = { collectionAId: 'missing', collectionBId };

      await expect(service.create(dto, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(dto, userId)).rejects.toThrow(
        /Collection not found or not owned by you: missing/,
      );
    });

    it('should throw NotFoundException when collection B is not found', async () => {
      prismaMock.collection.findFirst.mockImplementation(
        (args: { where: { id: string } }) =>
          Promise.resolve(
            args.where.id === collectionAId ? (mockCollectionA as never) : null,
          ),
      );

      const dto: CreateMatchDto = { collectionAId, collectionBId: 'missing' };

      await expect(service.create(dto, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(dto, userId)).rejects.toThrow(
        /Collection not found or not owned by you: missing/,
      );
    });

    it('should throw BadRequestException when collection A does not have exactly 9 players', async () => {
      const shortCollection = { ...mockCollectionA, playerIDs: ['p1', 'p2'] };
      prismaMock.collection.findFirst.mockImplementation(
        (args: { where: { id: string } }) =>
          Promise.resolve(
            args.where.id === collectionAId
              ? (shortCollection as never)
              : (mockCollectionB as never),
          ),
      );

      const dto: CreateMatchDto = { collectionAId, collectionBId };

      await expect(service.create(dto, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(dto, userId)).rejects.toThrow(
        /Collection A must have exactly 9 players/,
      );
      expect(prismaMock.match.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when collection B does not have exactly 9 players', async () => {
      const shortCollection = { ...mockCollectionB, playerIDs: ['p1'] };
      prismaMock.collection.findFirst.mockImplementation(
        (args: { where: { id: string } }) =>
          Promise.resolve(
            args.where.id === collectionBId
              ? (shortCollection as never)
              : (mockCollectionA as never),
          ),
      );

      const dto: CreateMatchDto = { collectionAId, collectionBId };

      await expect(service.create(dto, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(dto, userId)).rejects.toThrow(
        /Collection B must have exactly 9 players/,
      );
      expect(prismaMock.match.create).not.toHaveBeenCalled();
    });

    it('should create match and return result; stronger lineup (A) wins', async () => {
      prismaMock.collection.findFirst.mockImplementation(
        (args: { where: { id: string } }) =>
          Promise.resolve(
            args.where.id === collectionAId
              ? (mockCollectionA as never)
              : (mockCollectionB as never),
          ),
      );
      prismaMock.batting.findMany.mockImplementation(
        (args: { where: { playerID: { in: string[] } } }) =>
          Promise.resolve(
            args.where.playerID.in[0].startsWith('player-a')
              ? (strongBattingRows as never)
              : (weakBattingRows as never),
          ),
      );
      prismaMock.pitching.findMany.mockImplementation(
        (args: { where: { playerID: { in: string[] } } }) =>
          Promise.resolve(
            args.where.playerID.in[0].startsWith('player-a')
              ? (strongPitchingRows as never)
              : (weakPitchingRows as never),
          ),
      );

      const createdMatch = {
        id: 'match-1',
        collectionAId,
        collectionBId,
        winnerCollectionId: collectionAId,
        userId,
        createdAt: new Date('2024-06-01T12:00:00.000Z'),
      };
      prismaMock.match.create.mockResolvedValue(createdMatch as never);

      const dto: CreateMatchDto = { collectionAId, collectionBId };
      const result = await service.create(dto, userId);

      expect(result.id).toBe('match-1');
      expect(result.winnerCollectionId).toBe(collectionAId);
      expect(result.collectionAId).toBe(collectionAId);
      expect(result.collectionBId).toBe(collectionBId);
      expect(result.createdAt).toBe(createdMatch.createdAt.toISOString());
      expect(prismaMock.match.create).toHaveBeenCalledWith({
        data: {
          collectionAId,
          collectionBId,
          winnerCollectionId: collectionAId,
          userId,
        },
      });
    });

    it('should create match with B as winner when B is stronger', async () => {
      prismaMock.collection.findFirst.mockImplementation(
        (args: { where: { id: string } }) =>
          Promise.resolve(
            args.where.id === collectionAId
              ? (mockCollectionA as never)
              : (mockCollectionB as never),
          ),
      );
      const strongBattingForB = strongBattingRows.map((r, i) => ({
        ...r,
        playerID: ninePlayerIdsB[i],
      }));
      const strongPitchingForB = strongPitchingRows.map((r, i) => ({
        ...r,
        playerID: ninePlayerIdsB[i],
      }));
      prismaMock.batting.findMany.mockImplementation(
        (args: { where: { playerID: { in: string[] } } }) =>
          Promise.resolve(
            args.where.playerID.in[0].startsWith('player-a')
              ? (weakBattingRows as never)
              : (strongBattingForB as never),
          ),
      );
      prismaMock.pitching.findMany.mockImplementation(
        (args: { where: { playerID: { in: string[] } } }) =>
          Promise.resolve(
            args.where.playerID.in[0].startsWith('player-a')
              ? (weakPitchingRows as never)
              : (strongPitchingForB as never),
          ),
      );

      const createdMatch = {
        id: 'match-2',
        collectionAId,
        collectionBId,
        winnerCollectionId: collectionBId,
        userId,
        createdAt: new Date('2024-06-02T12:00:00.000Z'),
      };
      prismaMock.match.create.mockResolvedValue(createdMatch as never);

      const dto: CreateMatchDto = { collectionAId, collectionBId };
      const result = await service.create(dto, userId);

      expect(result.winnerCollectionId).toBe(collectionBId);
      expect(prismaMock.match.create).toHaveBeenCalledTimes(1);
      const createArg = prismaMock.match.create.mock.calls[0][0] as {
        data: { winnerCollectionId: string | null };
      };
      expect(createArg.data.winnerCollectionId).toBe(collectionBId);
    });
  });

  describe('findAll', () => {
    it('should return paginated matches for user', async () => {
      const matches = [
        {
          id: 'm1',
          collectionAId,
          collectionBId,
          winnerCollectionId: collectionAId,
          userId,
          createdAt: new Date(),
        },
      ];
      prismaMock.match.findMany.mockResolvedValue(matches as never);
      prismaMock.match.count.mockResolvedValue(1);

      const result = await service.findAll(userId);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(prismaMock.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
          skip: 0,
          take: 20,
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should apply pagination params', async () => {
      prismaMock.match.findMany.mockResolvedValue([]);
      prismaMock.match.count.mockResolvedValue(50);

      await service.findAll(userId, 2, 10);

      expect(prismaMock.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
          skip: 10,
          take: 10,
        }),
      );
      expect(prismaMock.match.count).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('findOne', () => {
    it('should return match when found for user', async () => {
      const match = {
        id: 'match-1',
        collectionAId,
        collectionBId,
        winnerCollectionId: collectionAId,
        userId,
        createdAt: new Date('2024-06-01T12:00:00.000Z'),
      };
      prismaMock.match.findFirst.mockResolvedValue(match as never);

      const result = await service.findOne('match-1', userId);

      expect(prismaMock.match.findFirst).toHaveBeenCalledWith({
        where: { id: 'match-1', userId },
      });
      expect(result.id).toBe('match-1');
      expect(result.createdAt).toBe(match.createdAt.toISOString());
    });

    it('should throw NotFoundException when match not found', async () => {
      prismaMock.match.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing', userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('missing', userId)).rejects.toThrow(
        'Match not found',
      );
    });
  });
});
