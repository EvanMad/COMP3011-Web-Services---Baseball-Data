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

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs a simple coin-toss to decide the winner. Can be replaced later with
   * a stats-based algorithm.
   */
  private decideWinner(
    collectionAId: string,
    collectionBId: string,
  ): string | null {
    return Math.random() < 0.5 ? collectionAId : collectionBId;
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

    const winnerCollectionId = this.decideWinner(collectionAId, collectionBId);

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
