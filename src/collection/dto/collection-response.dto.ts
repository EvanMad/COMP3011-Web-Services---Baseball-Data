import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Single collection as returned by GET /collection/:id and in list items.
 */
export class CollectionResponseDto {
  @ApiProperty({ example: 'clxx...', description: 'Collection ID' })
  id!: string;

  @ApiProperty({ example: 'My Favourites' })
  name!: string;

  @ApiPropertyOptional({ example: 'Best players of the 1920s' })
  description?: string | null;

  @ApiProperty({
    example: ['ruthba01', 'gehrilo01'],
    type: [String],
    description: 'Player IDs in this collection',
  })
  playerIDs!: string[];

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  updatedAt!: string;
}
