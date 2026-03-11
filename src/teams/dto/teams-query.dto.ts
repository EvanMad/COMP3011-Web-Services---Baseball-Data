import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from 'src/common/pagination.dto';

export class TeamsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'page must be at least 1' })
  page?: number = DEFAULT_PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'limit must be at least 1' })
  @Max(MAX_LIMIT, { message: `limit must not exceed ${MAX_LIMIT}` })
  limit?: number = DEFAULT_LIMIT;

  @IsOptional()
  @IsString()
  league?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1871, { message: 'year must be 1871 or later' })
  year?: number;
}
