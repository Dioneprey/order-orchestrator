import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'src/core/either';
import { OrderRepository } from '../repositories/order.repository';
import { ResourceAlreadyExists } from './@errors/resource-already-exists.error';
import { ResourceNotFoundError } from './@errors/resource-not-found.error';
import { ConvertCurrencyService } from '../enrichment/convert-currency.service';
import { Currency } from 'src/core/types/currency';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { Order, OrderStatus } from '../../entities/order';

export interface ProcessOrderUseCaseRequest {
  orderId: string;
}

type ProcessOrderUseCaseResponse = Either<
  ResourceAlreadyExists,
  {
    order: Order;
  }
>;

@Injectable()
export class ProcessOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private convertCurrencyService: ConvertCurrencyService,
  ) {}

  async execute({
    orderId,
  }: ProcessOrderUseCaseRequest): Promise<ProcessOrderUseCaseResponse> {
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

    orderExists.status = OrderStatus.PROCESSING_ENRICHMENT;
    await this.orderRepository.save(orderExists);

    const toCurrency =
      orderExists.currency === Currency.BRL ? Currency.USD : Currency.BRL;

    const { rate } = await this.convertCurrencyService.convert({
      fromCurrency: orderExists.currency,
      toCurrency: toCurrency,
    });

    orderExists.convertedAmount = orderExists.baseAmount * rate;
    orderExists.exchangeRate = rate;
    orderExists.convertedCurrency = toCurrency;
    orderExists.status = OrderStatus.COMPLETED_ENRICHMENT;

    const promises: Promise<any>[] = [this.orderRepository.save(orderExists)];

    if (orderExists.items) {
      orderExists.items.forEach((item) => {
        item.convertedUnitPrice = item.unitPrice * rate;
        item.convertedCurrency = toCurrency;
        item.exchangeRate = rate;
      });

      promises.push(this.orderItemRepository.saveMany(orderExists.items));
    }

    await Promise.all(promises);

    return right({
      order: orderExists,
    });
  }
}
