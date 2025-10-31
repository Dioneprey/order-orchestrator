import { expect } from 'vitest';
import { InMemoryOrderRepository } from 'test/repositories/in-memory-order.repository';
import { ProcessOrderUseCase } from './process-order';
import { randomUUID } from 'crypto';
import { InMemoryOrderItemRepository } from 'test/repositories/in-memory-order-item.repository';
import { Currency } from 'src/core/types/currency';
import { FakeConvertCurrencyService } from 'test/enrichment/fake-convert-currency.service';
import { makeOrder } from 'test/factories/make-order';
import { makeOrderItem } from 'test/factories/make-order-item';

let inMemoryOrderRepository: InMemoryOrderRepository;
let inMemoryOrderItemRepository: InMemoryOrderItemRepository;
let fakeConvertCurrencyService: FakeConvertCurrencyService;

let sut: ProcessOrderUseCase;

describe('Process order', () => {
  beforeEach(() => {
    inMemoryOrderRepository = new InMemoryOrderRepository();
    inMemoryOrderItemRepository = new InMemoryOrderItemRepository();
    fakeConvertCurrencyService = new FakeConvertCurrencyService();

    sut = new ProcessOrderUseCase(
      inMemoryOrderRepository,
      inMemoryOrderItemRepository,
      fakeConvertCurrencyService,
    );
  });

  it('should be able to process a order and make enrichment', async () => {
    const order = makeOrder();
    const items = await Promise.all([
      makeOrderItem({
        orderId: order.id,
      }),
      makeOrderItem({
        orderId: order.id,
      }),
    ]);

    inMemoryOrderRepository.create(order);
    inMemoryOrderItemRepository.createMany(items);

    const result = await sut.execute({
      orderId: order.id.toString(),
    });

    if (result.isLeft()) {
      throw new Error(`Use case failed: ${JSON.stringify(result.value)}`);
    }

    const returnedOrder = result.value.order;

    expect(returnedOrder.convertedCurrency).not.toBeNull();
  });
});
