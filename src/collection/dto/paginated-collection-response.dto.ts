import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from 'src/common/dto/pagination.dto';
import { CollectionResponseDto } from './collection-response.dto';

/**
 * Paginated list of collections. Returned by GET /collection.
 */
export class PaginatedCollectionResponseDto {
  @ApiProperty({ type: () => CollectionResponseDto, isArray: true, description: 'List of collections' })
  data!: CollectionResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
