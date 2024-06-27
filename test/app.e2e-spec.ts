import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as config from 'config';
import { Stage } from '../src/types';
import { initializeTransactionalContext } from 'typeorm-transactional';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    initializeTransactionalContext();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health-check (GET)', () => {
    return request(app.getHttpServer())
      .get('/health-check')
      .expect(200)
      .expect({
        stage: config.get<Stage>('env'),
        apiVersion: process.env.npm_package_version ?? 'unknown',
      });
  });
});
