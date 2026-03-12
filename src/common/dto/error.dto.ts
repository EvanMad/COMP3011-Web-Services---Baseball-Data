import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standard error response body returned on 4xx/5xx responses.
 */
export class ErrorDto {
  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode!: number;

  @ApiProperty({ example: 'Bad Request', description: 'Error type or title' })
  error!: string;

  @ApiProperty({
    example: 'Validation failed',
    description: 'Human-readable error message',
  })
  message!: string;

  @ApiPropertyOptional({
    description: 'Validation details (e.g. property-level errors when statusCode is 400)',
    example: [{ property: 'nameFirst', constraints: { minLength: 'nameFirst must be longer than or equal to 1 characters' } }],
  })
  errors?: Array<{ property: string; constraints?: Record<string, string> }>;
}
