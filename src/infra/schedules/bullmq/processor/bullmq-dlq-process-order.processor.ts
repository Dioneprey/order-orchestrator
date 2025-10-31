import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ProcessOrderParams } from 'src/domain/orders/application/schedules/process-order.schedule';
import { HandleFailedOrderUseCase } from 'src/domain/orders/application/use-cases/handle-failed-order';

export const DLQ_PROCESS_ORDER_PROCESSOR = 'dlq_process-order-processor';

@Processor(DLQ_PROCESS_ORDER_PROCESSOR)
export class BullMQDLQProcessOrderProcessor extends WorkerHost {
  private logger = new Logger(BullMQDLQProcessOrderProcessor.name);

  constructor(private handleFailedOrderUseCase: HandleFailedOrderUseCase) {
    super();
  }

  async process(job: Job<ProcessOrderParams>): Promise<void> {
    this.logger.warn(`🧊 Dead letter received for order ${job.data.orderId}`);

    await this.handleFailedOrderUseCase.execute({
      orderId: job.data.orderId,
    });
  }
}
