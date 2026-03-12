import { ApiProperty } from '@nestjs/swagger';

/**
 * Metadata for paginated list responses. Returned in the `meta` field alongside `data`.
 */
export class PaginationMetaDto {
  @ApiProperty({ example: 100, description: 'Total number of items across all pages' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Current page (1-based)' })
  page!: number;

  @ApiProperty({ example: 20, description: 'Number of items per page' })
  limit!: number;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  totalPages!: number;

  @ApiProperty({ example: true, description: 'Whether a next page exists' })
  hasNextPage!: boolean;

  @ApiProperty({ example: false, description: 'Whether a previous page exists' })
  hasPreviousPage!: boolean;
}
