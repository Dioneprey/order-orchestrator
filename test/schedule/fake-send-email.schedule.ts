import { ScheduleOptions } from 'src/core/types/schedule-options';
import {
  ProcessOrderParams,
  ProcessOrderSchedule,
} from 'src/domain/orders/application/schedules/process-order.schedule';

interface ScheduledJob {
  data: ProcessOrderParams;
  options?: ScheduleOptions;
}

export class FakeProcessOrderSchedule extends ProcessOrderSchedule {
  public jobs: ScheduledJob[] = [];

  async enqueueJob(
    data: ProcessOrderParams,
    options?: ScheduleOptions,
  ): Promise<void> {
    this.jobs.push({ data, options });
  }

  async removeJobById(id: string): Promise<void> {
    this.jobs = this.jobs.filter((job) => job.options?.jobId !== id);
  }
}
