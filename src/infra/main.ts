import './instrumentation';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { EnvService } from './env/env.service';
import { Env } from './env/env';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as Sentry from '@sentry/nestjs';
import { AllExceptionsFilter } from './http/filter/exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn', 'log']
          : ['error', 'warn', 'log', 'debug', 'verbose'],
    },
  );

  const envService = app.get<ConfigService<Env, true>>(EnvService);

  const port = envService.get('PORT');
  const nodeEnv = envService.get('NODE_ENV');
  const sentryDsn = envService.get('SENTRY_DSN');

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('order-orchestrator-api')
    .setDescription('API docs')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  // CORS liberado para todas as origens pelo o contexto do desafio técnico.
  // Em produção, deve-se restringir aos domínios autorizados.
  app.enableCors({
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: nodeEnv,
      tracesSampleRate: 1.0,
      sendDefaultPii: true,
    });
  }

  await app.listen(port, '0.0.0.0').then(() => {
    console.log(
      `[order-orchestrator - API] HTTP server running on port: ${port}!`,
    );
  });
}

bootstrap();
