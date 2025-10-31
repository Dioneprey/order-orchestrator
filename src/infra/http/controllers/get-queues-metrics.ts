import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { error } from 'console';
import { DLQ_PROCESS_ORDER_PROCESSOR } from 'src/infra/schedules/bullmq/processor/bullmq-dlq-process-order.processor';
import { PROCESS_ORDER_PROCESSOR } from 'src/infra/schedules/bullmq/processor/bullmq-process-order.processor';

@ApiTags('queues')
@Controller('/queue/metrics')
export class GetQueuesMetricsController {
  constructor(
    @InjectQueue(PROCESS_ORDER_PROCESSOR)
    private readonly processOrderQueue: Queue,
    @InjectQueue(DLQ_PROCESS_ORDER_PROCESSOR)
    private readonly dlqProcessOrderQueue: Queue,
  ) {}

  @Get()
  @ApiSecurity('x-api-key')
  @ApiOperation({
    summary: 'Get queue metrics',
    description:
      'Retorna informações gerais sobre a fila e a DLQ para monitoramento e administração.',
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas da fila retornadas com sucesso',
    schema: {
      example: {
        totalJobs: 120,
        waiting: 10,
        active: 5,
        completed: 100,
        failed: 5,
        delayed: 0,
        waitingInDlq: 2,
        completedInDlq: 2,
        lastFailedJob: {
          id: 'job-uuid-123',
          data: {
            orderId: 'ext-123',
          },
        },
      },
    },
  })
  async handle() {
    const totalJobs = await this.processOrderQueue.count();
    const waiting = await this.processOrderQueue.getWaitingCount();
    const active = await this.processOrderQueue.getActiveCount();
    const completed = await this.processOrderQueue.getCompletedCount();
    const failed = await this.processOrderQueue.getFailedCount();
    const delayed = await this.processOrderQueue.getDelayedCount();
    const waitingInDlq = await this.dlqProcessOrderQueue.count();
    const completedInDlq = await this.dlqProcessOrderQueue.getCompletedCount();

    const lastFailedJobArray = await this.processOrderQueue.getFailed(0, 0);
    const lastFailedJob = lastFailedJobArray[0] ?? null;

    return {
      totalJobs,
      waiting,
      active,
      completed,
      failed,
      delayed,
      waitingInDlq,
      completedInDlq,
      lastFailedJob: lastFailedJob
        ? {
            id: lastFailedJob.id,
            data: lastFailedJob.data,
            error: lastFailedJob,
          }
        : null,
    };
  }
}
