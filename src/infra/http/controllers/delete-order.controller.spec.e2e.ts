import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { EnvService } from 'src/infra/env/env.service';
import { OrderFactory } from 'test/factories/make-order';

describe('Delete order (E2E)', () => {
  let app: INestApplication;
  let orderFactory: OrderFactory;
  let envService: EnvService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [OrderFactory],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    envService = moduleRef.get(EnvService);
    orderFactory = moduleRef.get(OrderFactory);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[DELETE] /orders/:orderId', async () => {
    const order = await orderFactory.makePrismaOrder();

    const response = await request(app.getHttpServer())
      .delete(`/orders/${order.id.toString()}`)
      .set('x-api-key', envService.get('API_KEY'))
      .send();

    expect(response.statusCode).toBe(204);
  });
});
