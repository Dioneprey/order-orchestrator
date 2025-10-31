import { expect } from 'vitest';
import { InMemoryOrderRepository } from 'test/repositories/in-memory-order.repository';
import { makeOrder } from 'test/factories/make-order';
import { HandleFailedOrderUseCase } from './handle-failed-order';
import { OrderStatus } from '../../entities/order';

let inMemoryOrderRepository: InMemoryOrderRepository;

let sut: HandleFailedOrderUseCase;

describe('Handle Failed order', () => {
  beforeEach(() => {
    inMemoryOrderRepository = new InMemoryOrderRepository();

    sut = new HandleFailedOrderUseCase(inMemoryOrderRepository);
  });

  it('should handle order enrichment failure', async () => {
    const order = makeOrder();

    inMemoryOrderRepository.create(order);

    const result = await sut.execute({
      orderId: order.id.toString(),
    });

    if (result.isLeft()) {
      throw new Error(`Use case failed: ${JSON.stringify(result.value)}`);
    }

    const returnedOrder = result.value.order;

    expect(returnedOrder.status).toBe(OrderStatus.FAILED_ENRICHMENT);
  });
});
