import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication, serverUrl?: string) => {
  const builder = new DocumentBuilder()
    .setTitle('Billing Service API')
    .setDescription('Full API documentation for billing service')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Authorization', in: 'header' },
      'JWT-auth',
    )
    .addSecurityRequirements('JWT-auth');
  if (serverUrl) builder.addServer(serverUrl);

  const document = SwaggerModule.createDocument(app, builder.build(), {
    deepScanRoutes: true,
    ignoreGlobalPrefix: false,
  });

  SwaggerModule.setup('swagger/api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
};
