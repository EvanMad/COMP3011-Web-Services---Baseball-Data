import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Single match as returned by POST /match and GET /match list.
 */
export class MatchResponseDto {
  @ApiProperty({ example: 'clxx...', description: 'Match ID' })
  id!: string;

  @ApiProperty({
    example: 'claa...',
    description: 'First lineup (collection) ID',
  })
  collectionAId!: string;

  @ApiProperty({
    example: 'clbb...',
    description: 'Second lineup (collection) ID',
  })
  collectionBId!: string;

  @ApiPropertyOptional({
    example: 'claa...',
    description: 'ID of the winning collection, or null for a draw',
    nullable: true,
  })
  winnerCollectionId!: string | null;

  @ApiProperty({
    example: '2024-01-15T10:00:00.000Z',
    description: 'When the match was played',
  })
  createdAt!: string;
}
