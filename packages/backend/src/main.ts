import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

const app = await NestFactory.create(AppModule);

const port = parseInt(process.env.PORT ?? '3000', 10);
await app.listen(port);

console.log(`Application is running on: http://localhost:${port}`);
