import { Stage } from '.';

/**
 * @method GET
 * @endpoint /v1/health-check
 */
export type HealthCheckResponse = {
  stage: Stage;
  apiVersion: string;
};
