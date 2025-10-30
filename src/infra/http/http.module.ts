import { forwardRef, Module } from '@nestjs/common';
import { EnvModule } from '../env/env.module';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { HealthController } from './controllers/health.controller';
import { ReceiveOrdersController } from './controllers/webhooks/receive-orders-webhook.controller';
import { ReceiveOrderUseCase } from 'src/domain/orders/application/use-cases/receive-order';
import { BullMqConfigModule } from '../schedules/bullmq/bullmq.module';

@Module({
  imports: [
    AuthModule,
    EnvModule,
    DatabaseModule,
    forwardRef(() => BullMqConfigModule),
  ],
  controllers: [HealthController, ReceiveOrdersController],
  providers: [ReceiveOrderUseCase],
  exports: [],
})
export class HttpModule {}
