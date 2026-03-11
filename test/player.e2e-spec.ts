import request from 'supertest';
import type { Application } from 'express';
import { Test } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PlayerService } from '../src/player/player.service';
import { createTestApp } from './test-app.helper';

describe('PlayerController (e2e)', () => {
  let app: INestApplication;
  const server = () => request(app.getHttpServer() as Application);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PlayerService)
      .useValue({
        getPlayerById: (id: string) =>
          id === 'test-001'
            ? Promise.resolve({ id: 'test-001', name: 'Test Player' })
            : Promise.reject(new NotFoundException('Player not found')),
        findAll: () => Promise.resolve({ data: [{ id: 'test-001', name: 'Test Player' }], meta: {} as never }),
        updatePlayer: () => Promise.resolve({} as never),
        deletePlayer: () => Promise.resolve(),
        createPlayer: () => Promise.resolve({} as never),
      })
      .compile();

    app = await createTestApp(moduleRef);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /player/:id returns 404 for non-existent id', () => {
    return server().get('/player/nonexistent-id-99999').expect(404);
  });

  it('GET /player (list) returns 401 without auth', () => {
    return server().get('/player').expect(401);
  });

  it('GET /player/:id returns 200 for existing id', () => {
    return server().get('/player/test-001').expect(200);
  });
});
