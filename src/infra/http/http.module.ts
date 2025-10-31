import { forwardRef, Module } from '@nestjs/common';
import { EnvModule } from '../env/env.module';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { HealthController } from './controllers/health.controller';
import { ReceiveOrdersController } from './controllers/webhooks/receive-orders-webhook.controller';
import { ReceiveOrderUseCase } from 'src/domain/orders/application/use-cases/receive-order';
import { BullMqConfigModule } from '../schedules/bullmq/bullmq.module';
import { ProcessOrderUseCase } from 'src/domain/orders/application/use-cases/process-order';
import { EnrichmentModule } from '../enrichment/enrichment.module';
import { HandleFailedOrderUseCase } from 'src/domain/orders/application/use-cases/handle-failed-order';
import { DeleteOrdersController } from './controllers/delete-order.controller';
import { DeleteOrderUseCase } from 'src/domain/orders/application/use-cases/delete-order';
import { FetchOrdersController } from './controllers/fetch-orders.controller';
import { GetOrderByIdController } from './controllers/get-order-by-id.controller';
import { FetchOrdersUseCase } from 'src/domain/orders/application/use-cases/fetch-orders';
import { GetOrderByIdUseCase } from 'src/domain/orders/application/use-cases/get-order-by-id';
import { GetQueuesMetricsController } from './controllers/get-queues-metrics';

@Module({
  imports: [
    EnrichmentModule,
    AuthModule,
    EnvModule,
    DatabaseModule,
    forwardRef(() => BullMqConfigModule),
  ],
  controllers: [
    HealthController,

    // Orders
    ReceiveOrdersController,
    DeleteOrdersController,
    FetchOrdersController,
    GetOrderByIdController,

    // Queues
    GetQueuesMetricsController,
  ],
  providers: [
    // Orders
    ReceiveOrderUseCase,
    ProcessOrderUseCase,
    HandleFailedOrderUseCase,
    DeleteOrderUseCase,
    FetchOrdersUseCase,
    GetOrderByIdUseCase,
  ],
  exports: [ProcessOrderUseCase, HandleFailedOrderUseCase],
})
export class HttpModule {}
