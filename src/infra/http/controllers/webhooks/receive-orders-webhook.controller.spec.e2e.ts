import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { randomUUID } from 'crypto';
import { EnvService } from 'src/infra/env/env.service';

describe('Receive order (E2E)', () => {
  let app: INestApplication;
  let envService: EnvService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    envService = moduleRef.get(EnvService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /webhooks/orders', async () => {
    const orderId = 'ext-123';
    const idempotencyKey = randomUUID();

    const response = await request(app.getHttpServer())
      .post(`/webhooks/orders`)
      .set('x-api-key', envService.get('API_KEY'))
      .send({
        order_id: orderId,
        customer: { email: 'user@example.com', name: 'Ana' },
        items: [{ sku: 'ABC123', qty: 2, unit_price: 59.9 }],
        currency: 'USD',
        idempotency_key: idempotencyKey,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      order: expect.objectContaining({
        externalId: orderId,
        idempotencyKey: idempotencyKey,
      }),
    });
  });
});
