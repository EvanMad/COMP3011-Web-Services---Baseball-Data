import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Player } from 'generated/prisma/client';
import { StatsService } from '../stats/stats.service';

export interface PlayerWithStats extends Player {
  battingAverage: number;
}

@Injectable()
export class PlayerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly statsService: StatsService,
  ) {}

  async getPlayerByName(name: string): Promise<Player[]> {
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
    return players;
  }

  async getPlayerById(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { playerID: id },
    });

    if (!player) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }

    // 1. Aggregate all components for BA and OBP
    const stats = await this.prisma.batting.aggregate({
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
    });

    console.log('Aggregated Stats:', stats);

    const h = stats._sum.H || 0;
    const ab = stats._sum.AB || 0;
    const bb = stats._sum.BB || 0;
    const hbp = stats._sum.HBP || 0;
    const sf = stats._sum.SF || 0;
    const doubles = stats._sum.DOUBLE || 0;
    const triples = stats._sum.TRIPLE || 0;
    const hr = stats._sum.HR || 0;

    // 2. Calculate Batting Average
    const battingAverage = this.statsService.calculateBattingAverage(h, ab);

    // 3. Calculate On-Base Percentage
    const onBasePercentage = this.statsService.calculateOnBasePercentage(
      h,
      bb,
      hbp,
      ab,
      sf,
    );

    const sluggingPercentage = this.statsService.calculateSluggingPercentage(
      this.statsService.calculateTotalBases(h, doubles, triples, hr),
      ab,
    );

    const [mostHR, mostHits] = await Promise.all([
      this.prisma.batting.findFirst({ where: { playerID: id }, orderBy: { HR: 'desc' } }),
      this.prisma.batting.findFirst({ where: { playerID: id }, orderBy: { H: 'desc' } }),
    ]);

    return {
      ...player,
      career_batting: {
        battingAverage,
        onBasePercentage,
        sluggingPercentage,
      },
      careerHighs: {
        HR: mostHR ? mostHR.HR : 0,
        H: mostHits ? mostHits.H : 0,
      },
    };
  }

  async getAllPlayers(): Promise<Player[]> {
    const players = await this.prisma.player.findMany({});
    return players;
  }
}
