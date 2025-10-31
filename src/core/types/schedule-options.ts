import { JobsOptions } from 'bullmq';

export interface ScheduleOptions {
  delay?: number;
  attempts?: number;
  jobId?: string;
  removeOnFail?: boolean;
  removeOnComplete?: boolean;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
}
