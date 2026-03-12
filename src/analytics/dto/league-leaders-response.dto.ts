import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LeagueLeaderEntryDto {
  @ApiProperty({ example: 'ruthba01', description: 'Player ID' })
  playerID!: string;

  @ApiProperty({ example: 'Babe' })
  nameFirst!: string;

  @ApiProperty({ example: 'Ruth' })
  nameLast!: string;

  @ApiProperty({
    example: 1,
    description: 'Rank among league leaders (1-based)',
  })
  rank!: number;

  @ApiProperty({
    example: 60,
    description: 'Value of the stat (e.g. home runs, batting average)',
  })
  value!: number;
}

export class LeagueLeadersResponseDto {
  @ApiProperty({ example: 'batting' })
  category!: 'batting' | 'pitching';

  @ApiProperty({ example: 'homeRuns' })
  stat!: string;

  @ApiPropertyOptional({
    example: 1927,
    description: 'Season year when provided in query',
  })
  year?: number;

  @ApiPropertyOptional({
    example: 'AL',
    description: 'League ID when provided in query',
  })
  league?: string;

  @ApiProperty({ type: [LeagueLeaderEntryDto] })
  leaders!: LeagueLeaderEntryDto[];
}
