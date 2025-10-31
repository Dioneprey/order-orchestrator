import { Injectable } from '@nestjs/common';
import { Either, right } from 'src/core/either';
import { Order, OrderStatus } from '../../entities/order';
import { OrderRepository } from '../repositories/order.repository';

export interface FetchOrdersUseCaseRequest {
  pageIndex: number;
  pageSize: number;
  status?: OrderStatus;
}

type FetchOrdersUseCaseResponse = Either<
  undefined,
  {
    totalCount: number;
    totalPages: number;
    orders: Order[];
  }
>;

@Injectable()
export class FetchOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute({
    pageIndex,
    pageSize,
    status,
  }: FetchOrdersUseCaseRequest): Promise<FetchOrdersUseCaseResponse> {
    const {
      data: orders,
      totalCount,
      totalPages,
    } = await this.orderRepository.findMany({
      pageIndex,
      pageSize,
      filters: {
        status,
      },
      include: {
        items: true,
      },
    });

    return right({
      orders,
      totalCount,
      totalPages,
    });
  }
}
