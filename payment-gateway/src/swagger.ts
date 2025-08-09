import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication, serverUrl?: string) => {
  const builder = new DocumentBuilder()
    .setTitle('Gateway API')
    .setDescription('Full API documentation for Payment Gateway')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'api-key',
    )
    .addSecurityRequirements('api-key');
  if (serverUrl) builder.addServer(serverUrl);

  const document = SwaggerModule.createDocument(app, builder.build(), {
    ignoreGlobalPrefix: false,
    deepScanRoutes: true,
  });

  SwaggerModule.setup('swagger/api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
};
