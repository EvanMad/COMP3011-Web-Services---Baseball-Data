import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

const PRISMA_RECORD_NOT_FOUND = 'P2025';
const PRISMA_UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

interface PrismaErrorLike {
  code?: string;
  meta?: Record<string, unknown>;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // NestJS HttpException (includes BadRequest, NotFound, Conflict, etc.) — pass through
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const body = typeof res === 'object' ? res : { message: res };
      response.status(status).json(body);
      return;
    }

    // Prisma known request errors
    const prismaError = exception as PrismaErrorLike;
    if (prismaError?.code === PRISMA_RECORD_NOT_FOUND) {
      response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: 'Resource not found',
      });
      return;
    }
    if (prismaError?.code === PRISMA_UNIQUE_CONSTRAINT_VIOLATION) {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: 'A resource with this value already exists',
      });
      return;
    }

    // Log full error server-side; return safe message to client
    this.logger.error(
      exception instanceof Error ? exception.message : 'Unknown error',
      exception instanceof Error ? exception.stack : undefined,
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred. Please try again later.',
    });
  }
}
