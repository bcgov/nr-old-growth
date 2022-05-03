import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enable cors for localhost, local build, docker frontend and deploied frontend address
  const whitelist = [
    'http://localhost:8080',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ];
  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        whitelist.indexOf(origin) !== -1 ||
        origin.substring(0, 12) == 'http://10.97.' // openshift readiness probe
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  });

  const config = new DocumentBuilder()
    .setTitle('DB example')
    .setDescription('The user API description')
    .setVersion('1.0')
    .addTag('client')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
    SwaggerModule.setup('api', app, document);
  } else {
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        supportedSubmitMethods: [],
      },
    });
  }

  await app.listen(3000);
}
bootstrap();
