import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const mockHttpContext = {
      getResponse: () => mockResponse,
    };
    mockHost = {
      switchToHttp: () => mockHttpContext,
    } as unknown as ArgumentsHost;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('HttpException', () => {
    it('should pass through HttpException with object response', () => {
      const body = {
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
      };
      const exception = new HttpException(body, HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(body);
    });

    it('should pass through HttpException with string response as message', () => {
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    });
  });

  describe('Prisma errors', () => {
    it('should return 404 for P2025 (record not found)', () => {
      const exception = { code: 'P2025', meta: {} };

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: 'Resource not found',
      });
    });

    it('should return 409 for P2002 (unique constraint violation)', () => {
      const exception = { code: 'P2002', meta: { target: ['username'] } };

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: 'A resource with this value already exists',
      });
    });
  });

  describe('unknown errors', () => {
    it('should return 500 and log when exception is Error', () => {
      const err = new Error('Database connection failed');
      const logSpy = jest.spyOn(filter['logger'], 'error').mockImplementation();

      filter.catch(err, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred. Please try again later.',
      });
      expect(logSpy).toHaveBeenCalledWith(
        'Database connection failed',
        err.stack,
      );
    });

    it('should return 500 when exception is not an Error instance', () => {
      const logSpy = jest.spyOn(filter['logger'], 'error').mockImplementation();

      filter.catch('something broke', mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred. Please try again later.',
      });
      expect(logSpy).toHaveBeenCalledWith('Unknown error', undefined);
    });
  });
});
