import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class CreatePlayerDto {
  @ApiProperty({ example: 'ruthba01', description: 'Unique player ID' })
  @IsString()
  playerID!: string;

  @ApiProperty({ example: 'Babe', minLength: 1, maxLength: 50 })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nameFirst!: string;

  @ApiProperty({ example: 'Ruth', minLength: 1, maxLength: 50 })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nameLast!: string;

  @ApiPropertyOptional()
  @IsOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  dateOfDeath?: Date;

  @ApiPropertyOptional({ example: 'USA' })
  @IsOptional()
  @IsString()
  birthCountry?: string;

  @ApiProperty({ example: 215 })
  @IsNumber()
  weight!: number;

  @ApiProperty({ example: 72 })
  @IsNumber()
  height!: number;

  @ApiPropertyOptional({ example: 'L' })
  @IsOptional()
  @IsString()
  bats?: string;

  @ApiPropertyOptional({ example: 'L' })
  @IsOptional()
  @IsString()
  throws?: string;

  @ApiPropertyOptional({ type: () => CreateBattingDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBattingDto)
  batting?: CreateBattingDto[];

  @ApiPropertyOptional({ type: () => CreatePitchingDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePitchingDto)
  pitching?: CreatePitchingDto[];
}

export class CreateBattingDto {
  @ApiProperty({ example: 1927 }) yearID!: number;
  @ApiProperty({ example: 1 }) stint!: number;
  @ApiProperty({ example: 'NYA' }) teamID!: string;
  @ApiProperty({ example: 'AL' }) lgID!: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() G?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() AB?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() BB?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() R?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() H?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() HR?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() RBI?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() HBP?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() SF?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() SB?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() DOUBLE?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() TRIPLE?: number;
}

export class CreatePitchingDto {
  @ApiProperty({ example: 1927 }) yearID!: number;
  @ApiProperty({ example: 1 }) stint!: number;
  @ApiProperty({ example: 'NYA' }) teamID!: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() W?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() L?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() ERA?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() SO?: number;
}
