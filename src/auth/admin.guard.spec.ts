import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminGuard } from './admin.guard';
import { UsersService } from '../users/users.service';
import { ExecutionContext } from '@nestjs/common';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  const createMockContext = (
    headers: Record<string, string> = {},
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException when no token is present', async () => {
    const ctx = createMockContext();

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when Authorization is not Bearer', async () => {
    const ctx = createMockContext({ authorization: 'Basic xyz' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when token is invalid', async () => {
    const ctx = createMockContext({ authorization: 'Bearer bad-token' });
    mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('bad-token');
  });

  it('should throw UnauthorizedException when user is not admin', async () => {
    const ctx = createMockContext({ authorization: 'Bearer valid-token' });
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      username: 'u',
      role: 'user',
    });
    mockUsersService.findById.mockResolvedValue({ id: 'user-1', role: 'user' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    expect(mockUsersService.findById).toHaveBeenCalledWith('user-1');
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    const ctx = createMockContext({ authorization: 'Bearer valid-token' });
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      username: 'a',
      role: 'admin',
    });
    mockUsersService.findById.mockResolvedValue(null);

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should set request.user and return true when user is admin', async () => {
    const request: { headers: Record<string, string>; user?: unknown } = {
      headers: { authorization: 'Bearer valid-token' },
    };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'admin-1',
      username: 'admin',
      role: 'admin',
    });
    mockUsersService.findById.mockResolvedValue({
      id: 'admin-1',
      role: 'admin',
    });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(request.user).toEqual({
      sub: 'admin-1',
      username: 'admin',
      role: 'admin',
    });
    expect(mockUsersService.findById).toHaveBeenCalledWith('admin-1');
  });
});
