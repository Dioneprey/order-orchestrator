import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('development'),
  DATABASE_URL: z
    .string()
    .default('postgres://postgres:postgres@localhost:5455/postgres'),
  DATABASE_USER: z.string().default('postgres'),
  DATABASE_PASSWORD: z.string().default('postgres'),
  DATABASE_NAME: z.string().default('postgres'),
  DATABASE_PORT: z.coerce.number().default(5455),
  JAEGER_URL: z.string().default('http://localhost:4318/v1/traces'),
  API_KEY: z.string().default('order-orchestrator-inbazz'),
  REDIS_HOST: z.string().optional().default('localhost'),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  REDIS_PASSWORD: z.string().optional().default('redis'),
  PORT: z.coerce.number().optional().default(3333),
  SENTRY_DSN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
