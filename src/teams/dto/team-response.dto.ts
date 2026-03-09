import { Type } from 'class-transformer';

export class TeamStatsDto {
  games!: number;
  gamesHome?: number;
  wins!: number;
  losses!: number;
  runs!: number;
  atBats!: number;
  hits!: number;
  doubles!: number;
  triples!: number;
  homeRuns!: number;
  walks!: number;
  strikeouts!: number;
  stolenBases!: number;
  caughtStealing?: number;
  hitByPitch?: number;
  sacrificeFlies?: number;
}

export class PitchingAllowedDto {
  runsAllowed!: number;
  earnedRuns!: number;
  era!: number;
  completeGames!: number;
  shutouts!: number;
  saves!: number;
  outsPitched!: number;
  hitsAllowed!: number;
  hrAllowed!: number;
  walksAllowed!: number;
  strikeoutsAllowed!: number;
  errors!: number;
  doublePlays!: number;
  fieldingPercentage!: number;
}

export class TeamResultsDto {
  rank!: number;
  divisionWin!: boolean;
  wildCardWin!: boolean;
  leagueWin!: boolean;
  worldSeriesWin!: boolean;
}

export class TeamResponseDto {
  yearID!: number;
  teamID!: string;
  name!: string;
  league!: string;
  franchiseID!: string;
  divisionID?: string;
  park?: string;
  attendance?: number;

  // Grouped Standings/Awards
  @Type(() => TeamResultsDto)
  results!: TeamResultsDto;

  // Nested Stats Objects
  @Type(() => TeamStatsDto)
  batting!: TeamStatsDto;

  @Type(() => PitchingAllowedDto)
  pitching!: PitchingAllowedDto;

  // Optional relations (only if fetched)
  battingStats?: any[];
  pitchingStats?: any[];
}
