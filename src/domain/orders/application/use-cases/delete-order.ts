import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'src/core/either';
import { OrderRepository } from '../repositories/order.repository';
import { ResourceAlreadyExists } from './@errors/resource-already-exists.error';
import { ResourceNotFoundError } from './@errors/resource-not-found.error';
import { ProcessOrderSchedule } from '../schedules/process-order.schedule';

export interface DeleteOrderUseCaseRequest {
  orderId: string;
}

type DeleteOrderUseCaseResponse = Either<ResourceAlreadyExists, undefined>;

@Injectable()
export class DeleteOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly processOrderSchedule: ProcessOrderSchedule,
  ) {}

  async execute({
    orderId,
  }: DeleteOrderUseCaseRequest): Promise<DeleteOrderUseCaseResponse> {
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

    await Promise.all([
      this.orderRepository.delete(orderExists),
      this.processOrderSchedule.removeJobById(orderExists.id.toString()),
    ]);

    return right(undefined);
  }
}
