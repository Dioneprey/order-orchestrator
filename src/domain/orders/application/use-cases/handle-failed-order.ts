import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'src/core/either';
import { OrderRepository } from '../repositories/order.repository';
import { ResourceAlreadyExists } from './@errors/resource-already-exists.error';
import { ResourceNotFoundError } from './@errors/resource-not-found.error';
import { Order, OrderStatus } from '../../entities/order';

export interface HandleFailedOrderUseCaseRequest {
  orderId: string;
}

type HandleFailedOrderUseCaseResponse = Either<
  ResourceAlreadyExists,
  {
    order: Order;
  }
>;

@Injectable()
export class HandleFailedOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute({
    orderId,
  }: HandleFailedOrderUseCaseRequest): Promise<HandleFailedOrderUseCaseResponse> {
    const orderExists = await this.orderRepository.findByUniqueField({
      key: 'id',
      value: orderId,
      include: {
        items: true,
      },
    });

    if (!orderExists) {
      return left(new ResourceNotFoundError(`Order with id: ${orderId}`));
    }

    orderExists.status = OrderStatus.FAILED_ENRICHMENT;

    await this.orderRepository.save(orderExists);

    return right({
      order: orderExists,
    });
  }
}
