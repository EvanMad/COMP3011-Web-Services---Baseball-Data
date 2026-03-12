import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CareerBattingDto {
  @ApiProperty() battingAverage!: number;
  @ApiProperty() onBasePercentage!: number;
  @ApiProperty() sluggingPercentage!: number;
}

export class CareerPitchingDto {
  @ApiProperty() wins!: number;
  @ApiProperty() losses!: number;
  @ApiProperty() strikeouts!: number;
  @ApiProperty() averageEra!: number;
}

export class PlayerResponseDto {
  @ApiProperty() playerID!: string;
  @ApiProperty() nameFirst!: string;
  @ApiProperty() nameLast!: string;
  @ApiProperty() birthCountry!: string;
  @ApiProperty() weight!: number;
  @ApiProperty() height!: number;
  @ApiPropertyOptional({ description: 'Present when the player has batting stats' })
  career_batting?: CareerBattingDto;
  @ApiPropertyOptional({ description: 'Present when the player has batting stats' })
  careerHighs?: { HR: number; H: number };
  @ApiPropertyOptional({ description: 'Present when the player has pitching stats' })
  career_pitching?: CareerPitchingDto;
}
