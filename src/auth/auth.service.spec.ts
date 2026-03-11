import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../generated/prisma/client';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUsersService = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (bcrypt.compare as jest.Mock).mockImplementation(
      (pass: string, storedHash: string) =>
        Promise.resolve(pass === 'correct' && storedHash === 'hashed'),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    const mockUser: User = {
      id: 'user-1',
      username: 'testuser',
      password: 'hashed',
      role: 'user',
    };

    it('should return access_token when credentials are valid', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.signIn('testuser', 'correct');

      expect(usersService.findOne).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('correct', 'hashed');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-1',
        username: 'testuser',
        role: 'user',
      });
      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.signIn('unknown', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      await expect(service.signIn('testuser', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong', 'hashed');
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('signUp', () => {
    const newUser: User = {
      id: 'user-2',
      username: 'newuser',
      password: 'hashed',
      role: 'user',
    };

    it('should create user and return access_token', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(newUser);
      mockJwtService.signAsync.mockResolvedValue('new-jwt');

      const result = await service.signUp('newuser', 'password');

      expect(usersService.findOne).toHaveBeenCalledWith('newuser');
      expect(usersService.create).toHaveBeenCalledWith('newuser', 'password');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-2',
        username: 'newuser',
        role: 'user',
      });
      expect(result).toEqual({ access_token: 'new-jwt' });
    });

    it('should throw ConflictException when username already exists', async () => {
      mockUsersService.findOne.mockResolvedValue(newUser);

      await expect(service.signUp('newuser', 'password')).rejects.toThrow(
        new ConflictException('Username already exists'),
      );
      expect(usersService.create).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
