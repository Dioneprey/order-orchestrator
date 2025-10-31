import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'src/core/either';
import { OrderRepository } from '../repositories/order.repository';
import { ResourceAlreadyExists } from './@errors/resource-already-exists.error';
import { ProcessOrderSchedule } from '../schedules/process-order.schedule';
import { Order, OrderStatus } from '../../entities/order';
import { OrderItem } from '../../entities/order-item';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { Currency } from 'src/core/types/currency';

export interface ReceiveOrderUseCaseRequest {
  order_id: string;
  customer: {
    email: string;
    name: string;
  };
  items: {
    sku: string;
    qty: number;
    unit_price: number;
  }[];
  currency: Currency;
  idempotency_key: string;
}

type ReceiveOrderUseCaseResponse = Either<
  ResourceAlreadyExists,
  { order: Order }
>;

@Injectable()
export class ReceiveOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private processOrderSchedule: ProcessOrderSchedule,
  ) {}

  async execute({
    order_id,
    customer,
    items,
    currency,
    idempotency_key,
  }: ReceiveOrderUseCaseRequest): Promise<ReceiveOrderUseCaseResponse> {
    const orderAlreadyExists = await this.orderRepository.findByUniqueField({
      key: 'idempotencyKey',
      value: idempotency_key,
    });

    if (orderAlreadyExists) {
      return left(
        new ResourceAlreadyExists(
          `Order with idempotency key: ${idempotency_key}`,
        ),
      );
    }

    const baseAmount = items.reduce(
      (total, item) => total + item.unit_price * item.qty,
      0,
    );

    const order = Order.create({
      externalId: order_id,
      customerEmail: customer.email,
      customerName: customer.name,
      currency,
      idempotencyKey: idempotency_key,
      status: OrderStatus.RECEIVED,
      baseAmount,
    });

    const orderItems = items.map((item) => {
      return OrderItem.create({
        orderId: order.id,
        qty: item.qty,
        sku: item.sku,
        unitPrice: item.unit_price,
        currency,
      });
    });

    await this.orderRepository.create(order);
    await this.orderItemRepository.createMany(orderItems);

    await this.processOrderSchedule.enqueueJob(
      {
        orderId: order.id.toString(),
      },
      {
        jobId: order.id.toString(),
        removeOnComplete: false,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );

    return right({ order });
  }
}
