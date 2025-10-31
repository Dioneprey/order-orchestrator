import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { envSchema } from './env/env';

import { EnvModule } from './env/env.module';
import { SentryModule } from '@sentry/nestjs/setup';
import { HttpModule } from './http/http.module';
@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    HttpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
