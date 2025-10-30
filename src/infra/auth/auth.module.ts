import { Module } from '@nestjs/common';
import { EnvService } from 'src/infra/env/env.service';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyAuthGuard } from './guards/api-key.guard';

@Module({
  imports: [],
  providers: [
    EnvService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyAuthGuard,
    },
  ],
})
export class AuthModule {}
