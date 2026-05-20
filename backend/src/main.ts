import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const logger = new Logger('Bootstrap');

  // Parse environment-provided origin lists (comma-separated) and normalize
  const parseOrigins = (env?: string | undefined) =>
    (env || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        try {
          const candidate = /^https?:\/\//i.test(s) ? s : `http://${s}`;
          return new URL(candidate).origin;
        } catch {
          return s.replace(/\/+$/, '').toLowerCase();
        }
      });

  const whitelist = new Set<string>([
    ...parseOrigins(process.env.FRONTEND_URL),
    ...parseOrigins(process.env.BACKEND_URL),
  ]);

  // CORS: allow requests with no Origin (server-to-server / curl),
  // and allow only configured origins. Treat '*' explicitly if present.
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        // No Origin header — non-browser request (allow)
        return callback(null, true);
      }

      let normalizedOrigin = origin;
      try {
        normalizedOrigin = new URL(origin).origin;
      } catch {
        normalizedOrigin = origin.replace(/\/+$/, '').toLowerCase();
      }

      if (whitelist.has('*') || whitelist.has(normalizedOrigin)) {
        return callback(null, true);
      }

      logger.warn(`Blocked CORS origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    },
  });

  // Use NestJS built-in body parser methods (no direct express import needed)
  app.useBodyParser('json', { limit: '100mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '100mb' });

  // Global validation pipe (enable class-validator usage in DTOs)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('DB example')
    .setDescription('The user API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Only expose Swagger UI outside production by default. If you need it in
  // production, protect it with authentication or set an allowlist.
  if (process.env.NODE_ENV === 'production') {
    logger.log('Swagger UI is disabled in production');
  } else {
    SwaggerModule.setup('api', app, document);
  }

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
