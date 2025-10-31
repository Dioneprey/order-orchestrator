import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import {
  ProcessOrderParams,
  ProcessOrderSchedule,
} from 'src/domain/orders/application/schedules/process-order.schedule';
import { PROCESS_ORDER_PROCESSOR } from '../processor/bullmq-process-order.processor';
import { ScheduleOptions } from 'src/core/types/schedule-options';
import { DLQ_PROCESS_ORDER_PROCESSOR } from '../processor/bullmq-dlq-process-order.processor';

@Injectable()
export class BullMQProcessOrderScheduleService implements ProcessOrderSchedule {
  constructor(
    @InjectQueue(PROCESS_ORDER_PROCESSOR)
    private readonly processOrder: Queue<ProcessOrderParams>,
    @InjectQueue(DLQ_PROCESS_ORDER_PROCESSOR)
    private readonly dlqQueue: Queue<ProcessOrderParams>,
  ) {}

  async enqueueJob(data: ProcessOrderParams, options?: ScheduleOptions) {
    const bullmqOptions: JobsOptions = {
      delay: options?.delay,
      attempts: options?.attempts,
      jobId: options?.jobId,
      removeOnFail: options?.removeOnFail,
      removeOnComplete: options?.removeOnComplete,
      backoff: options?.backoff
        ? {
            type: options.backoff.type,
            delay: options.backoff.delay,
          }
        : undefined,
    };
    await this.processOrder.add(PROCESS_ORDER_PROCESSOR, data, bullmqOptions);
  }

  async removeJobById(id: string): Promise<void> {
    await this.processOrder.remove(id);
    await this.dlqQueue.remove(id);
  }
}
