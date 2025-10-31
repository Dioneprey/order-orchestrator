import { ScheduleOptions } from 'src/core/types/schedule-options';

export interface ProcessOrderParams {
  orderId: string;
}

export abstract class ProcessOrderSchedule {
  abstract enqueueJob(
    data: ProcessOrderParams,
    options?: ScheduleOptions,
  ): Promise<void>;

  abstract removeJobById(id: string): Promise<void>;
}
