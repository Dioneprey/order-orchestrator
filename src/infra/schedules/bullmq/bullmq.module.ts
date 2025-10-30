import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EnvModule } from 'src/infra/env/env.module';
import { EnvService } from 'src/infra/env/env.service';
import { BullBoardModule } from '@bull-board/nestjs';
import { FastifyAdapter } from '@bull-board/fastify';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { DatabaseModule } from 'src/infra/database/database.module';
import { HttpModule } from 'src/infra/http/http.module';
import {
  BullMQProcessOrderProcessor,
  PROCESS_ORDER_PROCESSOR,
} from './processor/bullmq-process-order.processor';
import { ProcessOrderSchedule } from 'src/domain/orders/application/schedules/process-order.schedule';
import { BullMQProcessOrderScheduleService } from './service/bullmq-process-order-schedule.service';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => HttpModule),
    BullModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: async (envService: EnvService) => ({
        connection: {
          host: envService.get('REDIS_HOST'),
          port: envService.get('REDIS_PORT'),
          password: envService.get('REDIS_PASSWORD'),
          db: 1,
        },
      }),
    }),
    BullModule.registerQueue({
      name: PROCESS_ORDER_PROCESSOR,
    }),

    BullBoardModule.forRoot({
      route: '/queues',
      adapter: FastifyAdapter,
    }),
    BullBoardModule.forFeature({
      name: PROCESS_ORDER_PROCESSOR,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [
    BullMQProcessOrderProcessor,
    {
      provide: ProcessOrderSchedule,
      useClass: BullMQProcessOrderScheduleService,
    },
  ],
  exports: [BullModule, ProcessOrderSchedule],
})
export class BullMqConfigModule {}
