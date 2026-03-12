import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from 'src/common/dto/pagination.dto';
import { PlayerResponseDto } from './player-response';

/**
 * Paginated list of players. Returned by GET /player.
 */
export class PaginatedPlayerResponseDto {
  @ApiProperty({ type: () => PlayerResponseDto, isArray: true, description: 'List of players' })
  data!: PlayerResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
