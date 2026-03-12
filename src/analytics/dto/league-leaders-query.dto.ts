import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { MAX_LIMIT } from 'src/common/pagination.dto';

export const BATTING_STATS = [
  'homeRuns',
  'hits',
  'runs',
  'rbi',
  'stolenBases',
  'walks',
  'battingAverage',
  'onBasePercentage',
  'sluggingPercentage',
] as const;

export const PITCHING_STATS = ['wins', 'strikeouts', 'losses', 'era'] as const;

export type BattingStat = (typeof BATTING_STATS)[number];
export type PitchingStat = (typeof PITCHING_STATS)[number];

export class LeagueLeadersQueryDto {
  @IsString()
  @IsIn(['batting', 'pitching'], {
    message: 'category must be one of: batting, pitching',
  })
  category!: 'batting' | 'pitching';

  @IsString()
  @IsIn([...BATTING_STATS, ...PITCHING_STATS], {
    message: 'stat must be a valid batting or pitching stat',
  })
  stat!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1871, { message: 'year must be 1871 or later' })
  year?: number;

  @IsOptional()
  @IsString()
  league?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'limit must be at least 1' })
  @Max(MAX_LIMIT, { message: `limit must not exceed ${MAX_LIMIT}` })
  limit?: number = 10;
}
