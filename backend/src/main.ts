import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { raw } from 'body-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for your frontend
app.enableCors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:5173'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});

  // Stripe webhook requires RAW body (must be BEFORE global pipes)
  app.use('/webhook/stripe', raw({ type: 'application/json' }));

  // Enable global validation for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // strips unknown fields
      forbidNonWhitelisted: false,
      transform: true,          // auto-transform payload types
    }),
  );

  await app.listen(3000);
  console.log(`🚀 Server running on http://localhost:3000`);
}

bootstrap();
