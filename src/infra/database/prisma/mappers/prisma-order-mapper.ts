import {
  Prisma,
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
} from '@generated/index';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Currency } from 'src/core/types/currency';
import { Order, OrderStatus } from 'src/domain/orders/entities/order';
import { OrderItem } from 'src/domain/orders/entities/order-item';

export type OrderWithInclude = PrismaOrder & {
  items?: PrismaOrderItem[];
};

export class PrismaOrderMapper {
  static toDomain(raw: OrderWithInclude): Order {
    return Order.create(
      {
        ...raw,
        currency: Currency[raw.currency],
        convertedCurrency: raw.convertedCurrency
          ? Currency[raw.convertedCurrency]
          : null,
        status: OrderStatus[raw.status],
        items: raw.items
          ? raw.items.map((i) =>
              OrderItem.create({
                ...i,
                convertedCurrency: i.convertedCurrency
                  ? Currency[i.convertedCurrency]
                  : null,
                currency: Currency[i.currency],
                orderId: new UniqueEntityID(i.orderId),
              }),
            )
          : undefined,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(order: Order): Prisma.OrderUncheckedCreateInput {
    return {
      id: order.id.toString(),
      externalId: order.externalId,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
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
