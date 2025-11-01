import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { BullMQInstrumentation } from '@appsignal/opentelemetry-instrumentation-bullmq';
import { FastifyOtelInstrumentation } from '@fastify/otel';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';

const traceExporter = new OTLPTraceExporter({
  url: process.env.JAEGER_URL,
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'order_orchestrator_api',
  }),
  traceExporter,
  instrumentations: [
    new FastifyOtelInstrumentation({
      registerOnInitialization: true,
      ignorePaths: (opts) => opts.url.startsWith('/api/health'),
    }),
    new PrismaInstrumentation(),
    new BullMQInstrumentation(),
    new HttpInstrumentation(),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});
