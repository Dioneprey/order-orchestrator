import { expect } from 'vitest';
import { InMemoryOrderRepository } from 'test/repositories/in-memory-order.repository';
import { FetchOrdersUseCase } from './fetch-orders';
import { makeOrder } from 'test/factories/make-order';

let inMemoryOrderRepository: InMemoryOrderRepository;

let sut: FetchOrdersUseCase;

describe('Fetch orders', () => {
  beforeEach(() => {
    inMemoryOrderRepository = new InMemoryOrderRepository();

    sut = new FetchOrdersUseCase(inMemoryOrderRepository);
  });

  it('should be able to fetch paginated orders', async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryOrderRepository.create(makeOrder());
    }

    const result = await sut.execute({
      pageIndex: 2,
      pageSize: 20,
    });

    if (result.isLeft()) {
      throw new Error('Failed');
    }

    expect(result.value.orders).toHaveLength(2);
  });
});
