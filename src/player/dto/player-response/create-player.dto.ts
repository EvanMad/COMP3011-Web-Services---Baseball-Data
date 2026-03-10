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
  @IsString()
  playerID!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nameFirst!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nameLast!: string;

  @IsOptional()
  dateOfBirth?: Date;

  @IsOptional()
  dateOfDeath?: Date;

  @IsOptional()
  @IsString()
  birthCountry?: string;

  @IsNumber()
  weight!: number;

  @IsNumber()
  height!: number;

  @IsOptional()
  @IsString()
  bats?: string;

  @IsOptional()
  @IsString()
  throws?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBattingDto)
  batting?: CreateBattingDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePitchingDto)
  pitching?: CreatePitchingDto[];
}

export class CreateBattingDto {
  @IsNumber()
  yearID!: number;

  @IsNumber()
  stint!: number;

  @IsString()
  teamID!: string;

  @IsString()
  lgID!: string;

  @IsOptional()
  @IsNumber()
  G?: number;

  @IsOptional()
  @IsNumber()
  AB?: number;

  @IsOptional()
  @IsNumber()
  BB?: number;

  @IsOptional()
  @IsNumber()
  R?: number;

  @IsOptional()
  @IsNumber()
  H?: number;

  @IsOptional()
  @IsNumber()
  HR?: number;

  @IsOptional()
  @IsNumber()
  RBI?: number;

  @IsOptional()
  @IsNumber()
  HBP?: number;

  @IsOptional()
  @IsNumber()
  SF?: number;

  @IsOptional()
  @IsNumber()
  SB?: number;

  @IsOptional()
  @IsNumber()
  DOUBLE?: number;

  @IsOptional()
  @IsNumber()
  TRIPLE?: number;
}

export class CreatePitchingDto {
  @IsNumber()
  yearID!: number;

  @IsNumber()
  stint!: number;

  @IsString()
  teamID!: string;

  @IsOptional()
  @IsNumber()
  W?: number;

  @IsOptional()
  @IsNumber()
  L?: number;

  @IsOptional()
  @IsNumber()
  ERA?: number;

  @IsOptional()
  @IsNumber()
  SO?: number;
}
