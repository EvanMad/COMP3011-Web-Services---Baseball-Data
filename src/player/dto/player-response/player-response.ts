import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CareerBattingDto {
  @ApiProperty({ example: 0.342 }) battingAverage!: number;
  @ApiProperty({ example: 0.474 }) onBasePercentage!: number;
  @ApiProperty({ example: 0.69 }) sluggingPercentage!: number;
}

export class CareerPitchingDto {
  @ApiProperty({ example: 94 }) wins!: number;
  @ApiProperty({ example: 46 }) losses!: number;
  @ApiProperty({ example: 1707 }) strikeouts!: number;
  @ApiProperty({ example: 2.28 }) averageEra!: number;
}

/** Career single-season highs for home runs and hits (when player has batting stats). */
export class CareerHighsDto {
  @ApiProperty({ example: 60, description: 'Single-season high for home runs' })
  HR!: number;

  @ApiProperty({ example: 192, description: 'Single-season high for hits' })
  H!: number;
}

export class PlayerResponseDto {
  @ApiProperty({ example: 'ruthba01', description: 'Unique player identifier' })
  playerID!: string;

  @ApiProperty({ example: 'Babe' })
  nameFirst!: string;

  @ApiProperty({ example: 'Ruth' })
  nameLast!: string;

  @ApiProperty({ example: 'USA' })
  birthCountry!: string;

  @ApiProperty({ example: 215, description: 'Weight in pounds' })
  weight!: number;

  @ApiProperty({ example: 72, description: 'Height in inches' })
  height!: number;

  @ApiPropertyOptional({
    description: 'Present when the player has batting stats',
    type: () => CareerBattingDto,
  })
  career_batting?: CareerBattingDto;

  @ApiPropertyOptional({
    description: 'Present when the player has batting stats',
    type: () => CareerHighsDto,
  })
  careerHighs?: CareerHighsDto;

  @ApiPropertyOptional({
    description: 'Present when the player has pitching stats',
    type: () => CareerPitchingDto,
  })
  career_pitching?: CareerPitchingDto;
}
