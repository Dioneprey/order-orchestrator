import { expect } from 'vitest';
import { InMemoryOrderRepository } from 'test/repositories/in-memory-order.repository';
import { ReceiveOrderUseCase } from './receive-order';
import { FakeProcessOrderSchedule } from 'test/schedule/fake-send-email.schedule';
import { randomUUID } from 'crypto';
import { InMemoryOrderItemRepository } from 'test/repositories/in-memory-order-item.repository';

let inMemoryOrderRepository: InMemoryOrderRepository;
let inMemoryOrderItemRepository: InMemoryOrderItemRepository;
let fakeProcessOrderSchedule: FakeProcessOrderSchedule;

let sut: ReceiveOrderUseCase;

describe('Receive order', () => {
  beforeEach(() => {
    inMemoryOrderRepository = new InMemoryOrderRepository();
    inMemoryOrderItemRepository = new InMemoryOrderItemRepository();
    fakeProcessOrderSchedule = new FakeProcessOrderSchedule();

    sut = new ReceiveOrderUseCase(
      inMemoryOrderRepository,
      inMemoryOrderItemRepository,
      fakeProcessOrderSchedule,
    );
  });

  it('should be able to receive a order and schedule a job', async () => {
    const result = await sut.execute({
      order_id: 'ext-123',
      customer: { email: 'user@example.com', name: 'Ana' },
      items: [{ sku: 'ABC123', qty: 2, unit_price: 59.9 }],
      currency: 'USD',
      idempotency_key: randomUUID(),
    });

    if (result.isLeft()) {
      throw new Error(`Use case failed: ${JSON.stringify(result.value)}`);
    }

    const order = result.value.order;

    expect(fakeProcessOrderSchedule.jobs).toHaveLength(1);
    expect(fakeProcessOrderSchedule.jobs[0].data).toEqual(
      expect.objectContaining({
        orderId: order.id.toString(),
      }),
    );
  });
});
