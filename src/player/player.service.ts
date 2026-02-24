import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StatsService } from '../stats/stats.service';
import { PlayerResponseDto } from './dto/player-response/player-response';

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

    // Map each player to the DTO format (assuming no stats for search list for brevity)
    return players.map(player => this.mapToResponseDto(player, null, null, null));
  }

  async getPlayerById(id: string): Promise<PlayerResponseDto> {
    const player = await this.prisma.player.findUnique({
      where: { playerID: id },
    });

    if (!player) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }

    // 1. Parallelize data fetching for performance
    const [stats, mostHR, mostHits] = await Promise.all([
      this.prisma.batting.aggregate({
        where: { playerID: id },
        _sum: { H: true, AB: true, BB: true, HBP: true, SF: true, DOUBLE: true, TRIPLE: true, HR: true },
      }),
      this.prisma.batting.findFirst({ where: { playerID: id }, orderBy: { HR: 'desc' } }),
      this.prisma.batting.findFirst({ where: { playerID: id }, orderBy: { H: 'desc' } }),
    ]);

    const s = stats._sum;

    // 2. Perform calculations via StatsService
    const career_batting = {
      battingAverage: this.statsService.calculateBattingAverage(s.H, s.AB || 0),
      onBasePercentage: this.statsService.calculateOnBasePercentage(
        s.H || 0, s.BB || 0, s.HBP || 0, s.AB || 0, s.SF || 0,
      ),
      sluggingPercentage: this.statsService.calculateSluggingPercentage(
        this.statsService.calculateTotalBases(s.H || 0, s.DOUBLE || 0, s.TRIPLE || 0, s.HR || 0),
        s.AB || 0,
      ),
    };

    const careerHighs = {
      HR: mostHR?.HR || 0,
      H: mostHits?.H || 0,
    };

    // 3. Return the mapped DTO
    return this.mapToResponseDto(player, career_batting, careerHighs);
  }

  // Helper method to keep code DRY (Don't Repeat Yourself)
  private mapToResponseDto(player: any, batting: any, highs: any): PlayerResponseDto {
    return {
      playerID: player.playerID,
      nameFirst: player.nameFirst,
      nameLast: player.nameLast,
      birthCountry: player.birthCountry,
      weight: player.weight,
      height: player.height,
      career_batting: batting,
      careerHighs: highs,
    };
  }

  async getAllPlayers(): Promise<PlayerResponseDto[]> {
    const players = await this.prisma.player.findMany({ take: 50 });
    return players.map(player => this.mapToResponseDto(player, null, null));
  }
}