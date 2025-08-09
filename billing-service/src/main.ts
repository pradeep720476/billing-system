import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ENV_KEYS } from './shared/types/env-keys';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const prefix = configService.get<string>(ENV_KEYS.PREFIX) || 'billing';
  app.setGlobalPrefix(prefix);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionFilter());

  const port = Number(process.env.PORT ?? 3002);

  const swaggerServerUrl = process.env.SWAGGER_SERVER_URL || `http://localhost:${port}`;

  setupSwagger(app, swaggerServerUrl);
  await app.listen(port);
}
bootstrap();
