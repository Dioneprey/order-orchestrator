import {
  InjectQueue,
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { ProcessOrderParams } from 'src/domain/orders/application/schedules/process-order.schedule';
import { ProcessOrderUseCase } from 'src/domain/orders/application/use-cases/process-order';
import { DLQ_PROCESS_ORDER_PROCESSOR } from './bullmq-dlq-process-order.processor';
import * as Sentry from '@sentry/nestjs';

export const PROCESS_ORDER_PROCESSOR = 'process-order-processor';

@Processor(PROCESS_ORDER_PROCESSOR)
export class BullMQProcessOrderProcessor extends WorkerHost {
  private logger = new Logger(BullMQProcessOrderProcessor.name);

  constructor(
    private processOrder: ProcessOrderUseCase,
    @InjectQueue(DLQ_PROCESS_ORDER_PROCESSOR)
    private readonly dlqQueue: Queue<ProcessOrderParams>,
  ) {
    super();
  }

  async process(job: Job<ProcessOrderParams>): Promise<void> {
    this.logger.debug(`Process job for order: ${job.data.orderId}, queued`);

    try {
      await this.processOrder.execute({
        orderId: job.data.orderId,
      });
    } catch (error) {
      throw error;
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<ProcessOrderParams>, error: Error) {
    const maxAttempts = job.opts.attempts ?? 1;
    if (job.attemptsMade < maxAttempts) {
      this.logger.warn(
        `Job failed for order ${job.data.orderId}, retrying... (${job.attemptsMade}/${maxAttempts})`,
      );
      return;
    }

    this.logger.error(
      `❌ Job permanently failed for order ${job.data.orderId}: ${error.message}`,
    );

    Sentry.captureException(error);

    await this.dlqQueue.add(DLQ_PROCESS_ORDER_PROCESSOR, job.data, {
      jobId: job.data.orderId,
      removeOnComplete: false,
      removeOnFail: false,
    });
  }
}
