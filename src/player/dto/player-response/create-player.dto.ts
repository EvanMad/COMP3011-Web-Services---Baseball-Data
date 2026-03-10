import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsNumber,
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
}
