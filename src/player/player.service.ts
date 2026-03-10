import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StatsService } from '../stats/stats.service';
import {
  CareerBattingDto,
  PlayerResponseDto,
} from './dto/player-response/player-response';
import { Player } from '../../generated/prisma/client';
import { UpdatePlayerDto } from './dto/player-response/update-player.dto';
import { CreatePlayerDto } from './dto/player-response/create-player.dto';

@Injectable()
export class PlayerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly statsService: StatsService,
  ) {}

  // Updated to return DTO array
  async getPlayerByName(name: string): Promise<PlayerResponseDto[]> {
    const players = await this.prisma.player.findMany({
      where: {
        OR: [
          { nameFirst: { contains: name, mode: 'insensitive' } },
          { nameLast: { contains: name, mode: 'insensitive' } },
        ],
      },
    });

    if (!players || players.length === 0) {
      throw new NotFoundException(`Player with name ${name} not found`);
    }
    return players.map((player) => this.mapToResponseDto(player, null, null));
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
    // Check for uniqueness
    const existingPlayer = await this.prisma.player.findUnique({
      where: { playerID: createPlayerDto.playerID },
    });

    if (existingPlayer) {
      throw new NotFoundException(
        `Player with id ${createPlayerDto.playerID} already exists`,
      );
    }

    const player = await this.prisma.player.create({
      data: createPlayerDto,
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

  async getAllPlayers(): Promise<PlayerResponseDto[]> {
    const players = await this.prisma.player.findMany({ take: 50 });
    return players.map((player) => this.mapToResponseDto(player, null, null));
  }
}
