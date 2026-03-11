import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

const SAFE_MESSAGE = 'Internal server error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // NestJS HttpException (including BadRequest, NotFound, Conflict, etc.) — pass through
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      let message: string | string[] = exception.message;
      if (typeof body === 'object' && body !== null && 'message' in body) {
        message = (body as { message?: string | string[] }).message ?? message;
      } else if (typeof body === 'string') {
        message = body;
      }
      response.status(status).json({
        statusCode: status,
        message,
        error: (body as { error?: string })?.error ?? exception.name,
      });
      return;
    }

    // Prisma known errors → map to appropriate HTTP status
    const prisma = this.getPrismaError(exception);
    if (prisma) {
      const { status, message } = prisma;
      this.logger.warn(`Prisma error: ${message}`);
      response.status(status).json({
        statusCode: status,
        message,
        error: status === 404 ? 'Not Found' : status === 409 ? 'Conflict' : 'Bad Request',
      });
      return;
    }

    // Any other error → 500 with safe message (do not leak details)
    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: SAFE_MESSAGE,
      error: 'Internal Server Error',
    });
  }

  private getPrismaError(exception: unknown): { status: number; message: string } | null {
    if (exception && typeof exception === 'object' && 'code' in exception) {
      const code = (exception as { code: string }).code;
      const meta = (exception as { meta?: { target?: string[] } }).meta;
      if (code === 'P2025') {
        return { status: HttpStatus.NOT_FOUND, message: 'Resource not found' };
      }
      if (code === 'P2002') {
        const target = meta?.target?.join(', ') ?? 'resource';
        return {
          status: HttpStatus.CONFLICT,
          message: `A record with this ${target} already exists`,
        };
      }
      if (code === 'P2003') {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid reference; related record may not exist',
        };
      }
    }
    return null;
  }
}
