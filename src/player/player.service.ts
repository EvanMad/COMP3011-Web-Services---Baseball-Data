import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Player } from 'generated/prisma/client';

export interface PlayerWithStats extends Player {
  battingAverage: number;
}

@Injectable()
export class PlayerService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlayerByName(name: string): Promise<Player[]> {
    const players = await this.prisma.player.findMany({
      where: {
        nameFirst: name,
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

  const h = stats._sum.H || 0;
  const ab = stats._sum.AB || 0;
  const bb = stats._sum.BB || 0;
  const hbp = stats._sum.HBP || 0;
  const sf = stats._sum.SF || 0;
  const doubles = stats._sum.DOUBLE || 0;
  const triples = stats._sum.TRIPLE || 0;
  const hr = stats._sum.HR || 0;

  // 2. Calculate Batting Average
  const battingAverage = ab > 0 ? parseFloat((h / ab).toFixed(3)) : 0;

  // 3. Calculate On-Base Percentage
  // Formula: (H + BB + HBP) / (AB + BB + HBP + SF)
  const onbases = h + bb + hbp;
  const pa = ab + bb + hbp + sf;
  const onBasePercentage = pa > 0 ? parseFloat((onbases / pa).toFixed(3)) : 0;

  const totalbases = (h - doubles - triples - hr) + (2 * doubles) + (3 * triples) + (4 * hr);
  const sluggingPercentage = ab > 0 ? parseFloat((totalbases / ab).toFixed(3)) : 0;

  const mostHR = await this.prisma.batting.findFirst({
    where: { playerID: id },
    orderBy: { HR: 'desc' },
  });

  const mostHits = await this.prisma.batting.findFirst({
    where: { playerID: id },
    orderBy: { H: 'desc' },
  });

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
    const players = await this.prisma.player.findMany({

    });
    return players;
  }
}
