import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient, User } from '../../generated/prisma/client';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock = mockDeep<PrismaClient>();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      const user: User = {
        id: '1',
        username: 'alice',
        password: 'hash',
        role: 'user',
      };
      prismaMock.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne('alice');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'alice' },
      });
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await service.findOne('nobody');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user: User = {
        id: 'user-1',
        username: 'bob',
        password: 'hash',
        role: 'user',
      };
      prismaMock.user.findUnique.mockResolvedValue(user);

      const result = await service.findById('user-1');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await service.findById('missing');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should hash password and create user', async () => {
      const created: User = {
        id: 'new-id',
        username: 'charlie',
        password: 'hashed-password',
        role: 'user',
      };
      prismaMock.user.create.mockResolvedValue(created);

      const result = await service.create('charlie', 'plain');

      expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
      expect(prismaMock.user.create).toHaveBeenCalledWith(
        {
          data: {
            username: 'charlie',
            password: 'hashed-password',
          },
        },
      );
      expect(result).toEqual(created);
    });
  });
});
