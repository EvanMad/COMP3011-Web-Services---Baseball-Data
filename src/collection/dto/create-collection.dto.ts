// create-collection.dto.ts
import {
  IsString,
  IsArray,
  IsOptional,
  MinLength,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Collection must contain at least one player' })
  @ArrayMaxSize(50, {
    message: 'Collection cannot contain more than 50 players',
  })
  @IsString({ each: true })
  playerIDs!: string[];
}
