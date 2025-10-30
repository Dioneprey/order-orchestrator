import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisRepository } from './redis/redis.service';
import { EnvModule } from '../env/env.module';
import { OrderRepository } from 'src/domain/orders/application/repositories/order.repository';
import { PrismaOrderRepository } from './prisma/repositories/prisma-order.repository';
import { PrismaOrderItemRepository } from './prisma/repositories/prisma-order-item.repository';
import { OrderItemRepository } from 'src/domain/orders/application/repositories/order-item.repository';

@Module({
  imports: [EnvModule],
  providers: [
    PrismaService,
    RedisRepository,
    {
      provide: OrderRepository,
      useClass: PrismaOrderRepository,
    },
    {
      provide: OrderItemRepository,
      useClass: PrismaOrderItemRepository,
    },
  ],
  exports: [
    PrismaService,
    RedisRepository,
    OrderRepository,
    OrderItemRepository,
  ],
})
export class DatabaseModule {}
