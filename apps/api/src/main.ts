import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DecimalToNumberInterceptor } from './common/interceptors/decimal-to-number.interceptor';

async function bootstrap() {
  // `rawBody: true` makes the raw body buffer available on `req.rawBody`,
  // which the Paymob webhook handler needs in order to verify the HMAC
  // signature over the exact bytes Paymob sent (any re-serialization
  // would shift whitespace and break the signature).
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  const logger = app.get(Logger);
  app.useLogger(logger);

  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  // Security
  app.use(helmet({ contentSecurityPolicy: false }));
  app.enableCors({
    origin: config.get<string[]>('corsOrigins') ?? [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  });
  app.use(cookieParser());

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global serialization (respects @Exclude / @Expose on entities)
  // + Decimal → number conversion for Prisma fields
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new DecimalToNumberInterceptor(),
  );

  // Global error formatting
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('🍕 Pizza Height API')
    .setDescription(
      'Backend API for the Pizza Height luxury pizza ordering platform.',
    )
    .setVersion('0.1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addTag('Auth')
    .addTag('Categories')
    .addTag('Menu Items')
    .addTag('Orders')
    .addTag('Addresses')
    .addTag('Coupons')
    .addTag('Customers')
    .addTag('Payments')
    .addTag('Settings')
    .addTag('Upload')
    .addTag('Health')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = config.get<number>('port') ?? 4000;
  await app.listen(port);

  logger.log(`🍕 Pizza Height API ready at http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger at http://localhost:${port}/api/docs`);
}

void bootstrap();
