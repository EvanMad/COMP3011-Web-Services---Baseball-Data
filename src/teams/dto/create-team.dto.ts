import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 2023, description: 'Season year' })
  @IsNumber()
  yearID!: number;

  @ApiProperty({ example: 'Boston Red Sox', maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  park?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  teamID!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lgID!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  franchID!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  divID?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  attendance?: number;
}
