import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from 'src/common/dto/pagination.dto';
import { TeamResponseDto } from './team-response.dto';

/**
 * Paginated list of teams. Returned by GET /teams and GET /teams/:id.
 */
export class PaginatedTeamResponseDto {
  @ApiProperty({
    type: () => TeamResponseDto,
    isArray: true,
    description: 'List of teams',
  })
  data!: TeamResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
