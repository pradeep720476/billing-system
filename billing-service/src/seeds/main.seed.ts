import { NestFactory } from '@nestjs/core';
import { SeederService } from './seeder.service';
import { AppModule } from 'src/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  if (process.env.RUN_SEED === 'true') {
    await app.get(SeederService).run();
  }
  await app.close();
}

bootstrap();
