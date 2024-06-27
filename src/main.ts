import * as config from 'config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationError, ValidationPipe, VersioningType } from '@nestjs/common';
import { CustomException } from './utils/execption';
import { HttpExceptionFilter } from './filters/http-exception';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { VersionHeaderInterceptor } from './interceptors/version-header';

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalFilters(HttpExceptionFilter(true));

  const documentBuilder = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('The commerce API description')
    .setVersion('1.0')
    .addTag('commerce')
    .build();
  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[] = []) => {
        const getErrorContent = (e: ValidationError) => {
          return e.constraints
            ? {
                property: e.property,
                errors: e.constraints && Object.keys(e.constraints),
              }
            : e.children
              ? {
                  property: e.property,
                  children: e.children.map(getErrorContent),
                }
              : {
                  property: e.property,
                };
        };

        return new CustomException({
          code: 'common/validation-error',
          statusCode: 400,
          expands: {
            detail: errors.map(getErrorContent),
          },
        });
      },
    }),
  );

  app.useGlobalInterceptors(
    VersionHeaderInterceptor('CommerceAPI', {
      version: process.env.npm_package_version,
      env: config.get<string>('env'),
    }),
  );

  const post = config.get<number>('port') ?? 2020;

  console.log(
    `🚀 Server is running on ${post}, mode: [${config.get<string>('env')}], debug: [${config.get<boolean>('debug')}]`,
  );

  await app.listen(post);
}
bootstrap();
