import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TeamStatsDto {
  @ApiProperty() games!: number;
  @ApiPropertyOptional() gamesHome?: number;
  @ApiProperty() wins!: number;
  @ApiProperty() losses!: number;
  @ApiProperty() runs!: number;
  @ApiProperty() atBats!: number;
  @ApiProperty() hits!: number;
  @ApiProperty() doubles!: number;
  @ApiProperty() triples!: number;
  @ApiProperty() homeRuns!: number;
  @ApiProperty() walks!: number;
  @ApiProperty() strikeouts!: number;
  @ApiProperty() stolenBases!: number;
  @ApiPropertyOptional() caughtStealing?: number;
  @ApiPropertyOptional() hitByPitch?: number;
  @ApiPropertyOptional() sacrificeFlies?: number;
}

export class PitchingAllowedDto {
  @ApiProperty() runsAllowed!: number;
  @ApiProperty() earnedRuns!: number;
  @ApiProperty() era!: number;
  @ApiProperty() completeGames!: number;
  @ApiProperty() shutouts!: number;
  @ApiProperty() saves!: number;
  @ApiProperty() outsPitched!: number;
  @ApiProperty() hitsAllowed!: number;
  @ApiProperty() hrAllowed!: number;
  @ApiProperty() walksAllowed!: number;
  @ApiProperty() strikeoutsAllowed!: number;
  @ApiProperty() errors!: number;
  @ApiProperty() doublePlays!: number;
  @ApiProperty() fieldingPercentage!: number;
}

export class TeamResultsDto {
  @ApiProperty() rank!: number;
  @ApiProperty() divisionWin!: boolean;
  @ApiProperty() wildCardWin!: boolean;
  @ApiProperty() leagueWin!: boolean;
  @ApiProperty() worldSeriesWin!: boolean;
}

export class TeamResponseDto {
  @ApiProperty() yearID!: number;
  @ApiProperty() teamID!: string;
  @ApiProperty() name!: string;
  @ApiProperty() league!: string;
  @ApiProperty() franchiseID!: string;
  @ApiPropertyOptional() divisionID?: string;
  @ApiPropertyOptional() park?: string;
  @ApiPropertyOptional() attendance?: number;

  @ApiProperty({ type: () => TeamResultsDto })
  @Type(() => TeamResultsDto)
  results!: TeamResultsDto;

  @ApiProperty({ type: () => TeamStatsDto })
  @Type(() => TeamStatsDto)
  batting!: TeamStatsDto;

  @ApiProperty({ type: () => PitchingAllowedDto })
  @Type(() => PitchingAllowedDto)
  pitching!: PitchingAllowedDto;

  @ApiPropertyOptional() battingStats?: unknown[];
  @ApiPropertyOptional() pitchingStats?: unknown[];
}
