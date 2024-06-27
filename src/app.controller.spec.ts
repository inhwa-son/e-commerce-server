import * as config from 'config';

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Stage } from './types';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('healthCheck', () => {
      expect(appController.healthCheck()).toEqual({
        stage: config.get<Stage>('env'),
        apiVersion: process.env.npm_package_version ?? 'unknown',
      });
    });
  });
});
