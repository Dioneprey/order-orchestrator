import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import {
  ProcessOrderParams,
  ProcessOrderSchedule,
} from 'src/domain/orders/application/schedules/process-order.schedule';
import { PROCESS_ORDER_PROCESSOR } from '../processor/bullmq-process-order.processor';

@Injectable()
export class BullMQProcessOrderScheduleService implements ProcessOrderSchedule {
  constructor(
    @InjectQueue(PROCESS_ORDER_PROCESSOR)
    private readonly processOrder: Queue<ProcessOrderParams>,
  ) {}

  async enqueueJob(data: ProcessOrderParams, options?: JobsOptions) {
    await this.processOrder.add(PROCESS_ORDER_PROCESSOR, data, options);
  }
}
