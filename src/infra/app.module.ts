import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env/env';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EnvModule } from './env/env.module';
import { SentryModule } from '@sentry/nestjs/setup';
import { HttpModule } from './http/http.module';
import { APP_GUARD } from '@nestjs/core';
@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: seconds(30),
        limit: 100,
      },
    ]),
    EnvModule,
    HttpModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
