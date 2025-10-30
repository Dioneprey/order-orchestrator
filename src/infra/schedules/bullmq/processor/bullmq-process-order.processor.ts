import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { OrderRepository } from 'src/domain/orders/application/repositories/order.repository';
import { ProcessOrderParams } from 'src/domain/orders/application/schedules/process-order.schedule';

export const PROCESS_ORDER_PROCESSOR = 'process-order-processor';

@Processor(PROCESS_ORDER_PROCESSOR)
export class BullMQProcessOrderProcessor extends WorkerHost {
  private logger = new Logger(BullMQProcessOrderProcessor.name);

  constructor(private orderRepository: OrderRepository) {
    super();
  }

  async process(job: Job<ProcessOrderParams>): Promise<void> {
    const orderExists = await this.orderRepository.findByUniqueField({
      key: 'id',
      value: job.data.orderId,
    });

    this.logger.debug(`Process job for order: ${job.data.orderId}, queued`);
  }
}
