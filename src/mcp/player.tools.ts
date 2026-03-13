import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { PlayerService } from '../player/player.service';
import type { PlayerResponseDto } from '../player/dto/player-response/player-response';

@Injectable()
export class PlayerTools {
  constructor(private readonly playerService: PlayerService) {}

  @Tool({
    name: 'search_players',
    description:
      'Search for players by (partial) name or birth country to discover matching player IDs.',
    parameters: z.object({
      name: z
        .string()
        .optional()
        .describe(
          'Optional partial name to search for (matches first or last name, case-insensitive).',
        ),
      country: z
        .string()
        .optional()
        .describe(
          'Optional birth country to filter by (e.g. "USA", "Canada", "Japan").',
        ),
      page: z
        .number()
        .int()
        .min(1)
        .default(1)
        .describe('Page number for pagination (1-based).'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10)
        .describe('Max number of players per page (1–50).'),
    }),
  })
  async searchPlayers(params: {
    name?: string;
    country?: string;
    page: number;
    limit: number;
  }): Promise<{
    summary: string;
    players: { playerId: string; name: string; country: string }[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { name, country, page, limit } = params;

    const result = await this.playerService.findAll(page, limit, name, country);

    const summaryParts: string[] = ['Player search results'];
    if (name) summaryParts.push(`matching name "${name}"`);
    if (country) summaryParts.push(`from country "${country}"`);
    const summary =
      summaryParts.join(' ') +
      `: ${result.data.length} players on this page (of ${result.meta.total} total).`;

    const players = result.data.map((p: PlayerResponseDto) => ({
      playerId: p.playerID,
      name: `${p.nameFirst} ${p.nameLast}`.trim(),
      country: p.birthCountry ?? '',
    }));

    const pagination = {
      page: result.meta.page,
      limit: result.meta.limit,
      total: result.meta.total,
      totalPages: result.meta.totalPages,
    };

    return { summary, players, pagination };
  }

  @Tool({
    name: 'get_player_stats',
    description:
      'Get a player by ID with their career batting stats, career highs, and physical attributes.',
    parameters: z.object({
      playerId: z
        .string()
        .min(1)
        .describe('Player ID (e.g. "ruthba01") to look up.'),
    }),
  })
  async getPlayerStats(args: { playerId: string }): Promise<{
    summary: string;
    player: PlayerResponseDto;
  }> {
    const player = await this.playerService.getPlayerById(args.playerId);

    const summary = `Player ${player.nameFirst} ${player.nameLast} (${player.playerID}), from ${player.birthCountry}, height ${player.height}, weight ${player.weight}.`;

    return { summary, player };
  }
}
