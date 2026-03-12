import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from 'src/common/dto/pagination.dto';
import { MatchResponseDto } from './match-response.dto';

/**
 * Paginated list of matches. Returned by GET /match.
 */
export class PaginatedMatchResponseDto {
  @ApiProperty({
    type: () => MatchResponseDto,
    isArray: true,
    description: 'List of matches',
  })
  data!: MatchResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
