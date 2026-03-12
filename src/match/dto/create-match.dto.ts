import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Body for creating a match between two lineups (collections of 9 players).
 */
export class CreateMatchDto {
  @ApiProperty({
    example: 'clxx...',
    description:
      'ID of the first collection (lineup). Must have exactly 9 players.',
  })
  @IsString()
  @IsNotEmpty()
  collectionAId!: string;

  @ApiProperty({
    example: 'clyy...',
    description:
      'ID of the second collection (lineup). Must have exactly 9 players.',
  })
  @IsString()
  @IsNotEmpty()
  collectionBId!: string;
}
