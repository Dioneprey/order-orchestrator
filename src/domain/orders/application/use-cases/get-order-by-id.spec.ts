import { expect } from 'vitest';
import { InMemoryOrderRepository } from 'test/repositories/in-memory-order.repository';
import { GetOrderByIdUseCase } from './get-order-by-id';
import { makeOrder } from 'test/factories/make-order';
import { ResourceNotFoundError } from './@errors/resource-not-found.error';

let inMemoryOrderRepository: InMemoryOrderRepository;

let sut: GetOrderByIdUseCase;

describe('Get order by id', () => {
  beforeEach(() => {
    inMemoryOrderRepository = new InMemoryOrderRepository();

    sut = new GetOrderByIdUseCase(inMemoryOrderRepository);
  });

  it('should be able to get a order by id', async () => {
    const order = makeOrder({});

    inMemoryOrderRepository.create(order);

    const result = await sut.execute({
      orderId: order.id.toString(),
    });

    if (result.isLeft()) {
      throw new Error('Failed');
    }

    expect(result.value.order.id.toString()).toEqual(order.id.toString());
  });

  it('should not be able to get an order that does not exist', async () => {
    const orderId = 'order-that-does-not-exist';

    const result = await sut.execute({
      orderId: orderId,
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
