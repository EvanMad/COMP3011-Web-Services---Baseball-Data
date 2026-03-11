import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StatsService } from '../stats/stats.service';
import {
  CareerBattingDto,
  PlayerResponseDto,
} from './dto/player-response/player-response';
import { Player } from '../../generated/prisma/client';
import { UpdatePlayerDto } from './dto/player-response/update-player.dto';
import { CreatePlayerDto } from './dto/player-response/create-player.dto';
import {
  getPaginationParams,
  paginate,
  PaginatedResponse,
} from 'src/common/pagination.dto';

@Injectable()
export class PlayerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly statsService: StatsService,
  ) {}

  async getPlayerByName(
    name: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<PlayerResponseDto>> {
    const { skip, take } = getPaginationParams(page, limit);
    const where = {
      OR: [
        { nameFirst: { contains: name, mode: 'insensitive' as const } },
        { nameLast: { contains: name, mode: 'insensitive' as const } },
      ],
    };
    const [players, total] = await Promise.all([
      this.prisma.player.findMany({
        where,
        skip,
        take,
        orderBy: [{ nameLast: 'asc' }, { nameFirst: 'asc' }],
      }),
      this.prisma.player.count({ where }),
    ]);

    if (total === 0) {
      throw new NotFoundException(`Player with name ${name} not found`);
    }
    const data = players.map((player) =>
      this.mapToResponseDto(player, null, null),
    );
    return paginate(data, total, page, limit);
  }

  async getPlayerById(id: string): Promise<PlayerResponseDto> {
    const player = await this.prisma.player.findUnique({
      where: { playerID: id },
    });

    if (!player) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }

    const [stats, mostHR, mostHits] = await Promise.all([
      this.prisma.batting.aggregate({
        where: { playerID: id },
        _sum: {
          H: true,
          AB: true,
          BB: true,
          HBP: true,
          SF: true,
          DOUBLE: true,
          TRIPLE: true,
          HR: true,
        },
      }),
      this.prisma.batting.findFirst({
        where: { playerID: id },
        orderBy: { HR: 'desc' },
      }),
      this.prisma.batting.findFirst({
        where: { playerID: id },
        orderBy: { H: 'desc' },
      }),
    ]);

    const s = stats._sum;

    const career_batting = {
      battingAverage: this.statsService.calculateBattingAverage(
        s.H || 0,
        s.AB || 0,
      ),
      onBasePercentage: this.statsService.calculateOnBasePercentage(
        s.H || 0,
        s.BB || 0,
        s.HBP || 0,
        s.AB || 0,
        s.SF || 0,
      ),
      sluggingPercentage: this.statsService.calculateSluggingPercentage(
        this.statsService.calculateTotalBases(
          s.H || 0,
          s.DOUBLE || 0,
          s.TRIPLE || 0,
          s.HR || 0,
        ),
        s.AB || 0,
      ),
    };

    const careerHighs = {
      HR: mostHR?.HR || 0,
      H: mostHits?.H || 0,
    };

    return this.mapToResponseDto(player, career_batting, careerHighs);
  }

  async updatePlayer(
    id: string,
    updatePlayerDto: UpdatePlayerDto,
  ): Promise<PlayerResponseDto> {
    const player = await this.prisma.player.findUnique({
      where: { playerID: id },
    });

    if (!player) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }

    return this.prisma.player
      .update({
        where: { playerID: id },
        data: updatePlayerDto,
      })
      .then((updatedPlayer) =>
        this.mapToResponseDto(updatedPlayer, null, null),
      );
  }

  async createPlayer(
    createPlayerDto: CreatePlayerDto,
  ): Promise<PlayerResponseDto> {
    const { batting, pitching, ...playerData } = createPlayerDto;

    // 1. Uniqueness check (Good as is)
    const existingPlayer = await this.prisma.player.findUnique({
      where: { playerID: playerData.playerID },
    });

    if (existingPlayer) {
      throw new ConflictException(
        `Player with id ${playerData.playerID} already exists`,
      );
    }

    // 2. Perform the Nested Create
    const player = await this.prisma.player.create({
      data: {
        ...playerData,
        // Create Batting entries and connect to Team
        battingStats: batting
          ? {
              create: batting.map((b) => ({
                stint: b.stint,
                lgID: b.lgID,
                G: b.G,
                AB: b.AB,
                BB: b.BB,
                R: b.R,
                H: b.H,
                HR: b.HR,
                RBI: b.RBI,
                HBP: b.HBP,
                SF: b.SF,
                SB: b.SB,
                DOUBLE: b.DOUBLE,
                TRIPLE: b.TRIPLE,
                team: {
                  connect: {
                    yearID_teamID: {
                      yearID: b.yearID,
                      teamID: b.teamID,
                    },
                  },
                },
              })),
            }
          : undefined,

        // Create Pitching entries and connect to Team
        pitchingStats: pitching
          ? {
              create: pitching.map((p) => ({
                stint: p.stint,
                W: p.W,
                L: p.L,
                ERA: p.ERA,
                SO: p.SO,
                team: {
                  connect: {
                    yearID_teamID: {
                      yearID: p.yearID,
                      teamID: p.teamID,
                    },
                  },
                },
              })),
            }
          : undefined,
      },
      include: {
        battingStats: true,
        pitchingStats: true,
      },
    });

    return this.mapToResponseDto(player, null, null);
  }

  async deletePlayer(id: string): Promise<void> {
    const player = await this.prisma.player.findUnique({
      where: { playerID: id },
    });

    if (!player) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }

    await this.prisma.player.delete({
      where: { playerID: id },
    });
  }

  private mapToResponseDto(
    player: Player,
    batting: CareerBattingDto | null,
    highs: { HR: number; H: number } | null,
  ): PlayerResponseDto {
    return {
      playerID: player.playerID,
      nameFirst: player.nameFirst,
      nameLast: player.nameLast,
      birthCountry: player.birthCountry ?? 'NaN',
      weight: player.weight,
      height: player.height,
      career_batting: batting ?? undefined,
      careerHighs: highs ?? undefined,
    };
  }

  async getAllPlayers(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<PlayerResponseDto>> {
    const { skip, take } = getPaginationParams(page, limit);
    const [players, total] = await Promise.all([
      this.prisma.player.findMany({
        skip,
        take,
        orderBy: [{ nameLast: 'asc' }, { nameFirst: 'asc' }],
      }),
      this.prisma.player.count(),
    ]);
    const data = players.map((player) =>
      this.mapToResponseDto(player, null, null),
    );
    return paginate(data, total, page, limit);
  }
}
