import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

const app = await NestFactory.create(AppModule);

// Enable CORS for frontend and Swagger UI
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:8080',
];
app.enableCors({
  origin: corsOrigins,
  credentials: true,
});

const port = parseInt(process.env.PORT ?? '3000', 10);
await app.listen(port);

console.log(`⚡️ Backend is running on PORT ${port}`);
