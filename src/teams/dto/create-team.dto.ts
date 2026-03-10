import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateTeamDto {
  yearID!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  park?: string;

  @IsOptional()
  @IsString()
  teamID!: string;

  @IsOptional()
  @IsString()
  lgID!: string;

  @IsOptional()
  @IsString()
  franchID!: string;

  @IsOptional()
  @IsString()
  divID?: string;

  @IsOptional()
  attendance?: number;
}
