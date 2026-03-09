export class CareerBattingDto {
  battingAverage!: number;
  onBasePercentage!: number;
  sluggingPercentage!: number;
}

export class CareerPitchingDto {
  wins!: number;
  losses!: number;
  strikeouts!: number;
  averageEra!: number;
}

export class PlayerResponseDto {
  playerID!: string;
  nameFirst!: string;
  nameLast!: string;
  birthCountry!: string;
  weight!: number;
  height!: number;
  /** Present when the player has batting stats. */
  career_batting?: CareerBattingDto;
  /** Present when the player has batting stats. */
  careerHighs?: {
    HR: number;
    H: number;
  };
  /** Present when the player has pitching stats. */
  career_pitching?: CareerPitchingDto;
}
