import 'dotenv/config';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

const logDir = join(process.cwd(), 'logs');
mkdirSync(logDir, { recursive: true });

const winstonLogger = WinstonModule.createLogger({
  transports: [
    new transports.File({
      filename: join(logDir, 'app.log'),
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, context, ...meta }) => {
          const ts =
            typeof timestamp === 'string'
              ? timestamp
              : JSON.stringify(timestamp ?? '');
          const lvl = String(level ?? 'info');
          const msg = typeof message === 'string' ? message : String(message);
          const ctx =
            context === undefined || context === null
              ? ''
              : typeof context === 'string'
                ? `[${context}] `
                : `[${JSON.stringify(context)}] `;
          const metaStr =
            Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
          return `${ts} [${lvl}] ${ctx}${msg} ${metaStr}`.trim();
        }),
      ),
    }),
  ],
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });
  app.enableCors({
    origin: true, // allow the request's Origin (e.g. localhost:5173, comp3011.evanmadurai.co.uk)
    credentials: true,
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          errors: errors.map((e) => ({
            property: e.property,
            constraints: e.constraints,
          })),
        }),
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Web Services API')
    .setDescription(
      'API for baseball players, teams, and user collections. Authenticate via `/auth/login` or `/auth/register` and use the returned JWT as Bearer token for protected routes.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT from /auth/login or /auth/register',
      },
      'defaultBearerAuth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  winstonLogger.log?.(
    'Application listening on port ' + String(port),
    'Bootstrap',
  );
}
void bootstrap();
