import { OrderItem } from 'src/domain/orders/entities/order-item';

export class OrderItemPresenter {
  static toHTTP(orderItem: OrderItem | null) {
    if (orderItem === null) {
      return {};
    }

    return {
      id: orderItem.id.toString(),
      orderId: orderItem.orderId.toString(),
      sku: orderItem.sku,
      qty: orderItem.qty,
      currency: orderItem.currency,
      convertedCurrency: orderItem.convertedCurrency,
      convertedUnitPrice: orderItem.convertedUnitPrice,
      exchangeRate: orderItem.exchangeRate,
      unitPrice: orderItem.unitPrice,
      createdAt: orderItem.createdAt,
      updatedAt: orderItem.updatedAt,
    };
  }
}
