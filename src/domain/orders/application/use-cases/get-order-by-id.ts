import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'src/core/either';
import { Order } from '../../entities/order';
import { OrderRepository } from '../repositories/order.repository';
import { ResourceNotFoundError } from './@errors/resource-not-found.error';

export interface GetOrderByIdUseCaseRequest {
  orderId: string;
}

type GetOrderByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    order: Order;
  }
>;

@Injectable()
export class GetOrderByIdUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute({
    orderId,
  }: GetOrderByIdUseCaseRequest): Promise<GetOrderByIdUseCaseResponse> {
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

    return right({
      order: orderExists,
    });
  }
}
