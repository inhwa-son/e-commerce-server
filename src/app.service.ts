import * as config from 'config';
import { Injectable } from '@nestjs/common';
import { HealthCheckResponse } from './types/response';
import { Stage } from './types';

@Injectable()
export class AppService {
  healthCheck(): HealthCheckResponse {
    return {
      stage: config.get<Stage>('env'),
      apiVersion: process.env.npm_package_version ?? 'unknown',
    };
  }
}
