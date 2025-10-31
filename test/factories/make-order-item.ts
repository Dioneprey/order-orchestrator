import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { faker } from '@faker-js/faker';
import { Currency } from 'src/core/types/currency';
import {
  OrderItem,
  OrderItemProps,
} from 'src/domain/orders/entities/order-item';

export function makeOrderItem(
  override: Partial<OrderItemProps> = {},
  id?: UniqueEntityID,
) {
  const orderitem = OrderItem.create(
    {
      orderId: override.orderId || new UniqueEntityID(),
      sku: override.sku || faker.commerce.product(),
      qty: override.qty || faker.number.int({ max: 10 }),
      currency: override.currency || Currency.BRL,
      unitPrice: override.unitPrice || faker.number.float(),
      ...override,
    },
    id,
  );

  return orderitem;
}
