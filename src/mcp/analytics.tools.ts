import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { AnalyticsService } from '../analytics/analytics.service';
import type { LeagueLeadersResponseDto } from '../analytics/dto/league-leaders-response.dto';

type LeagueLeadersParams = {
  category: 'batting' | 'pitching';
  stat: string;
  year?: number;
  league?: string;
  limit: number;
};

@Injectable()
export class AnalyticsTools {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Tool({
    name: 'get_league_leaders',
    description:
      'Get top players for a given stat (e.g. homeRuns, battingAverage, era), optionally filtered by year and league.',
    parameters: z.object({
      category: z
        .enum(['batting', 'pitching'])
        .describe(
          'Which category of stats to query: "batting" or "pitching".',
        ),
      stat: z.string().describe(
        'Stat identifier, e.g. "homeRuns", "battingAverage", "era". Must be valid for the chosen category.',
      ),
      year: z
        .number()
        .int()
        .optional()
        .describe('Optional season year to filter by (e.g. 2001).'),
      league: z
        .string()
        .optional()
        .describe('Optional league code to filter by (e.g. "AL", "NL").'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10)
        .describe('Maximum number of leaders to return (1–50).'),
    }),
  })
  async getLeagueLeaders(
    params: LeagueLeadersParams,
  ): Promise<{
    summary: string;
    leaders: {
      rank: number;
      playerId: string;
      name: string;
      value: number;
      line: string;
    }[];
  }> {
    const raw: LeagueLeadersResponseDto =
      await this.analyticsService.getLeagueLeaders(params);

    const contextParts: string[] = [];
    if (raw.year !== undefined) {
      contextParts.push(String(raw.year));
    }
    if (raw.league) {
      contextParts.push(raw.league);
    }
    const context =
      contextParts.length > 0 ? ` (${contextParts.join(', ')})` : '';

    const summary = `Top ${raw.leaders.length} ${raw.category} league leaders for "${raw.stat}"${context}.`;

    const leaders = raw.leaders.map((entry) => {
      const name = `${entry.nameFirst} ${entry.nameLast}`.trim();
      const line = `#${entry.rank} ${name} (${entry.playerID}) - ${raw.stat}: ${entry.value}`;
      return {
        rank: entry.rank,
        playerId: entry.playerID,
        name,
        value: entry.value,
        line,
      };
    });

    return { summary, leaders };
  }
}

