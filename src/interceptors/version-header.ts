import { NestInterceptor, ExecutionContext, CallHandler, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export type VersionHeaderInterceptorArgs = {
  version?: string;
  env: string;
};

export const VersionHeaderInterceptor = (
  key: string,
  { version, env }: VersionHeaderInterceptorArgs,
): NestInterceptor => {
  @Injectable()
  class VersionHeaderInterceptorMixin implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        tap(() => {
          const res = context.switchToHttp().getResponse();

          res.header(`${key}-Version`, version || 'unknown');
          res.header(`${key}-Env`, env);
        }),
      );
    }
  }

  return new VersionHeaderInterceptorMixin();
};
