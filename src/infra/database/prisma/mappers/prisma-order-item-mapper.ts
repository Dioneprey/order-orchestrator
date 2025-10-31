import { Prisma, OrderItem as PrismaOrderItem } from '@generated/index';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Currency } from 'src/core/types/currency';
import { OrderItem } from 'src/domain/orders/entities/order-item';

export class PrismaOrderItemMapper {
  static toDomain(raw: PrismaOrderItem): OrderItem {
    return OrderItem.create(
      {
        ...raw,
        convertedCurrency: raw.convertedCurrency
          ? Currency[raw.convertedCurrency]
          : null,
        currency: Currency[raw.currency],
        orderId: new UniqueEntityID(raw.orderId),
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(orderItem: OrderItem): Prisma.OrderItemUncheckedCreateInput {
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
