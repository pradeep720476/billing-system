import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_KEYS } from './shared/types/env-keys';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix(configService.get<string>(ENV_KEYS.PREFIX) || 'gateway');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionFilter());
  const port = Number(process.env.PORT ?? 3001);
  const swaggerServerUrl = process.env.SWAGGER_SERVER_URL || `http://localhost:${port}`;
  setupSwagger(app, swaggerServerUrl);
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
