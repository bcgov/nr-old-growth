import { afterEach, describe, expect, it } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { HealthIndicatorService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { AppModule } from './../src/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/health (GET) returns 200 and healthy status when database is reachable', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      info: {
        database: {
          status: 'up',
        },
      },
      error: {},
      details: {
        database: {
          status: 'up',
        },
      },
    });
  });

  it('/health (GET) returns 503 and error details when database connection fails', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TypeOrmHealthIndicator)
      .useFactory({
        factory: (indicatorService: HealthIndicatorService) => ({
          pingCheck: (key: string) =>
            indicatorService.check(key).attempt(async () => {
              throw new Error('Connection refused');
            }),
        }),
        inject: [HealthIndicatorService],
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      status: 'error',
      info: {},
      error: {
        database: {
          status: 'down',
          message: 'Connection refused',
        },
      },
      details: {
        database: {
          status: 'down',
        },
      },
    });
  });
});
