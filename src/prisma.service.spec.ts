import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const originalEnv = process.env.DATABASE_URL;

  beforeAll(() => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ?? 'postgresql://user:pass@localhost:5432/test';
  });

  afterAll(() => {
    process.env.DATABASE_URL = originalEnv;
  });

  it('should be defined when instantiated with DATABASE_URL', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    const service = module.get<PrismaService>(PrismaService);
    expect(service).toBeDefined();
  });
});
