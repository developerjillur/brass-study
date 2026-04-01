import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SnakeCaseInterceptor } from './common/interceptors/snake-case.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new SnakeCaseInterceptor());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://brassphdstudy.com',
      'https://www.brassphdstudy.com',
      process.env.FRONTEND_URL || '',
    ].filter(Boolean),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
