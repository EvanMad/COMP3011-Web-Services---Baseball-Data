import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  getPaginationParams,
  paginate,
  PaginatedResponse,
} from 'src/common/pagination.dto';
import { CreateMatchDto } from './dto/create-match.dto';

/** Number of players required in each lineup for a match. */
export const LINEUP_SIZE = 9;

/** Weights for a simple offensive "runs created" style score (career totals). */
const OFFENSIVE_WEIGHTS = {
  R: 1,
  RBI: 1,
  HR: 2,
  H: 0.5,
  BB: 0.6,
} as const;

/** Scale for ERA in pitching score (lower ERA = better). Default ERA assumed when missing is 4.5. */
const DEFAULT_ERA = 4.5;
const PITCHING_ERA_WEIGHT = 8;

interface LineupStrength {
  offensive: number;
  pitching: number;
}

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregates batting and pitching stats for a set of player IDs and returns
   * a single offensive score and pitching score for the lineup.
   */
  private async getLineupStrength(
    playerIDs: string[],
  ): Promise<LineupStrength> {
    const [battingRows, pitchingRows] = await Promise.all([
      this.prisma.batting.findMany({
        where: { playerID: { in: playerIDs } },
        select: {
          playerID: true,
          R: true,
          RBI: true,
          HR: true,
          H: true,
          BB: true,
        },
      }),
      this.prisma.pitching.findMany({
        where: { playerID: { in: playerIDs } },
        select: {
          playerID: true,
          SO: true,
          W: true,
          L: true,
          ERA: true,
        },
      }),
    ]);

    const battingByPlayer = new Map<
      string,
      { R: number; RBI: number; HR: number; H: number; BB: number }
    >();
    for (const row of battingRows) {
      const cur = battingByPlayer.get(row.playerID) ?? {
        R: 0,
        RBI: 0,
        HR: 0,
        H: 0,
        BB: 0,
      };
      battingByPlayer.set(row.playerID, {
        R: cur.R + (row.R ?? 0),
        RBI: cur.RBI + (row.RBI ?? 0),
        HR: cur.HR + (row.HR ?? 0),
        H: cur.H + (row.H ?? 0),
        BB: cur.BB + (row.BB ?? 0),
      });
    }

    const pitchingByPlayer = new Map<
      string,
      { SO: number; W: number; L: number; ERA: number; count: number }
    >();
    for (const row of pitchingRows) {
      const cur = pitchingByPlayer.get(row.playerID) ?? {
        SO: 0,
        W: 0,
        L: 0,
        ERA: 0,
        count: 0,
      };
      const era = row.ERA ?? DEFAULT_ERA;
      pitchingByPlayer.set(row.playerID, {
        SO: cur.SO + (row.SO ?? 0),
        W: cur.W + (row.W ?? 0),
        L: cur.L + (row.L ?? 0),
        ERA: cur.ERA + era,
        count: cur.count + 1,
      });
    }

    let offensive = 0;
    for (const pid of playerIDs) {
      const b = battingByPlayer.get(pid);
      if (b) {
        offensive +=
          b.R * OFFENSIVE_WEIGHTS.R +
          b.RBI * OFFENSIVE_WEIGHTS.RBI +
          b.HR * OFFENSIVE_WEIGHTS.HR +
          b.H * OFFENSIVE_WEIGHTS.H +
          b.BB * OFFENSIVE_WEIGHTS.BB;
      }
    }

    let pitching = 0;
    for (const pid of playerIDs) {
      const p = pitchingByPlayer.get(pid);
      if (p) {
        const avgEra = p.count > 0 ? p.ERA / p.count : DEFAULT_ERA;
        pitching +=
          (p.SO ?? 0) +
          2 * ((p.W ?? 0) - (p.L ?? 0)) -
          avgEra * PITCHING_ERA_WEIGHT;
      }
    }

    return { offensive, pitching };
  }

  /**
   * Decides the winner using lineup offensive and pitching stats. Each team's
   * "runs" = own offense minus opponent's pitching; higher wins. Tie broken randomly.
   */
  private decideWinner(
    collectionAId: string,
    collectionBId: string,
    strengthA: LineupStrength,
    strengthB: LineupStrength,
  ): string | null {
    const runsA = strengthA.offensive - strengthB.pitching;
    const runsB = strengthB.offensive - strengthA.pitching;
    if (Math.abs(runsA - runsB) < 0.001) {
      return Math.random() < 0.5 ? collectionAId : collectionBId;
    }
    return runsA > runsB ? collectionAId : collectionBId;
  }

  async create(createMatchDto: CreateMatchDto, userId: string) {
    const { collectionAId, collectionBId } = createMatchDto;
    if (collectionAId === collectionBId) {
      throw new BadRequestException(
        'Collection A and Collection B must be different',
      );
    }

    const [collectionA, collectionB] = await Promise.all([
      this.prisma.collection.findFirst({
        where: { id: collectionAId, userId },
      }),
      this.prisma.collection.findFirst({
        where: { id: collectionBId, userId },
      }),
    ]);

    if (!collectionA) {
      throw new NotFoundException(
        `Collection not found or not owned by you: ${collectionAId}`,
      );
    }
    if (!collectionB) {
      throw new NotFoundException(
        `Collection not found or not owned by you: ${collectionBId}`,
      );
    }

    if (collectionA.playerIDs.length !== LINEUP_SIZE) {
      throw new BadRequestException(
        `Collection A must have exactly ${LINEUP_SIZE} players (lineup size). It has ${collectionA.playerIDs.length}.`,
      );
    }
    if (collectionB.playerIDs.length !== LINEUP_SIZE) {
      throw new BadRequestException(
        `Collection B must have exactly ${LINEUP_SIZE} players (lineup size). It has ${collectionB.playerIDs.length}.`,
      );
    }

    const [strengthA, strengthB] = await Promise.all([
      this.getLineupStrength(collectionA.playerIDs),
      this.getLineupStrength(collectionB.playerIDs),
    ]);
    const winnerCollectionId = this.decideWinner(
      collectionAId,
      collectionBId,
      strengthA,
      strengthB,
    );

    const match = await this.prisma.match.create({
      data: {
        collectionAId,
        collectionBId,
        winnerCollectionId,
        userId,
      },
    });

    return {
      ...match,
      createdAt: match.createdAt.toISOString(),
    };
  }

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<
    PaginatedResponse<{
      id: string;
      collectionAId: string;
      collectionBId: string;
      winnerCollectionId: string | null;
      createdAt: Date;
    }>
  > {
    const { skip, take } = getPaginationParams(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.match.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.match.count({ where: { userId } }),
    ]);
    return paginate(data, total, page, limit);
  }

  async findOne(id: string, userId: string) {
    const match = await this.prisma.match.findFirst({
      where: { id, userId },
    });
    if (!match) {
      throw new NotFoundException('Match not found');
    }
    return {
      ...match,
      createdAt: match.createdAt.toISOString(),
    };
  }
}
