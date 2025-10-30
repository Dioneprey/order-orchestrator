import { Prisma, OrderItem as PrismaOrderItem } from '@generated/index';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { OrderItem } from 'src/domain/orders/entities/order-item';

export class PrismaOrderItemMapper {
  static toDomain(raw: PrismaOrderItem): OrderItem {
    return OrderItem.create(
      {
        orderId: new UniqueEntityID(raw.orderId),
        sku: raw.sku,
        qty: raw.qty,
        unitPrice: raw.unitPrice,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
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
      unitPrice: orderItem.unitPrice,
      createdAt: orderItem.createdAt,
      updatedAt: orderItem.updatedAt,
    };
  }
}
