import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 3000;

  app.enableCors({
    origin:[
      'http://localhost:5173', // your frontend dev origin
      'https://my-nest-app-production-cdd3.up.railway.app', // production domain 
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],

  });

  // app.useStaticAssets(join(__dirname, "..", "uploads"), {
  //   prefix: "/uploads/",
  // });
  // 👇 Use process.cwd() to serve from project root

  app.useStaticAssets(join(process.cwd(), "uploads"), {
    prefix: "/uploads/",
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Products API')
    .setDescription('CRUD API built with Nest.js + Prisma')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port, () => {
    console.log(`Server running on ${process.env.APP_URL}`);
    console.log(process.cwd());
  });
}

bootstrap();
