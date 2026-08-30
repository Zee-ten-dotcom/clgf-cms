import {
  ValidationPipe,
} from '@nestjs/common';
import {
  ConfigService,
} from '@nestjs/config';
import {
  NestFactory,
} from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app =
    await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  const configService =
    app.get(ConfigService);

  app.use(helmet());

  app.useGlobalFilters(
    new AllExceptionsFilter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const nodeEnv =
    configService.get<string>(
      'NODE_ENV',
    ) ?? 'development';

  const configuredOrigins =
    (
      configService.get<string>(
        'CORS_ORIGINS',
      ) ?? ''
    )
      .split(',')
      .map((origin) =>
        origin.trim(),
      )
      .filter(Boolean);

  app.enableCors({
    origin: (
      origin,
      callback,
    ) => {
      if (!origin) {
        return callback(
          null,
          true,
        );
      }

      if (
        nodeEnv !== 'production'
      ) {
        const allowedLocal =
          /^http:\/\/localhost:\d+$/.test(
            origin,
          ) ||
          /^http:\/\/127\.0\.0\.1:\d+$/.test(
            origin,
          );

        if (allowedLocal) {
          return callback(
            null,
            true,
          );
        }
      }

      if (
        configuredOrigins.includes(
          origin,
        )
      ) {
        return callback(
          null,
          true,
        );
      }

      return callback(
        new Error(
          'Origin not allowed by CORS',
        ),
        false,
      );
    },
    credentials: true,
  });

  const port =
    configService.get<number>(
      'PORT',
    ) ?? 3000;

  await app.listen(port);
}

bootstrap();
