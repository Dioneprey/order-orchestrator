import { expect } from 'vitest';
import { InMemoryOrderRepository } from 'test/repositories/in-memory-order.repository';
import { makeOrder } from 'test/factories/make-order';
import { OrderStatus } from '../../entities/order';
import { DeleteOrderUseCase } from './delete-order';
import { FakeProcessOrderSchedule } from 'test/schedule/fake-send-email.schedule';

let inMemoryOrderRepository: InMemoryOrderRepository;
let fakeProcessOrderSchedule: FakeProcessOrderSchedule;

let sut: DeleteOrderUseCase;

describe('Delete order', () => {
  beforeEach(() => {
    inMemoryOrderRepository = new InMemoryOrderRepository();
    fakeProcessOrderSchedule = new FakeProcessOrderSchedule();

    sut = new DeleteOrderUseCase(
      inMemoryOrderRepository,
      fakeProcessOrderSchedule,
    );
  });

  it('should delete order', async () => {
    const order = makeOrder();

    inMemoryOrderRepository.create(order);
    fakeProcessOrderSchedule.enqueueJob(
      {
        orderId: order.id.toString(),
      },
      {
        jobId: order.id.toString(),
      },
    );

    expect(fakeProcessOrderSchedule.jobs).toHaveLength(1);
    expect(inMemoryOrderRepository.items).toHaveLength(1);

    const result = await sut.execute({
      orderId: order.id.toString(),
    });

    if (result.isLeft()) {
      throw new Error(`Use case failed: ${JSON.stringify(result.value)}`);
    }

    expect(fakeProcessOrderSchedule.jobs).toHaveLength(0);
    expect(inMemoryOrderRepository.items).toHaveLength(0);
  });
});
