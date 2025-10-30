import { Order } from 'src/domain/orders/entities/order';
import { OrderItemPresenter } from './order-item.presenter';

export class OrderPresenter {
  static toHTTP(order: Order | null) {
    if (order === null) {
      return {};
    }

    return {
      id: order.id.toString(),
      externalId: order.externalId,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      items: order.items
        ? order.items.map((item) => OrderItemPresenter.toHTTP(item))
        : undefined,
      currency: order.currency,
      idempotencyKey: order.idempotencyKey,
      status: order.status,
      baseAmount: order.baseAmount,
      convertedAmount: order.convertedAmount,
      exchangeRate: order.exchangeRate,
      convertedCurrency: order.convertedCurrency,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
