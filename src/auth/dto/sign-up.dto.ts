import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'john_doe', description: 'Username' })
  @IsString()
  username!: string;

  @ApiProperty({ example: 'secret123', description: 'Password', minLength: 1 })
  @IsString()
  @MinLength(1)
  password!: string;
}
