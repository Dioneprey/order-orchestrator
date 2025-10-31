import { OrderItem, OrderItemKey } from '../../entities/order-item';

export interface OrderItemRepositoryFindByUniqueFieldProps {
  key: OrderItemKey;
  value: string;
}

export abstract class OrderItemRepository {
  abstract findByUniqueField({
    key,
    value,
  }: OrderItemRepositoryFindByUniqueFieldProps): Promise<OrderItem | null>;

  abstract createMany(orderItems: OrderItem[]): Promise<OrderItem[]>;
  abstract saveMany(orderItems: OrderItem[]): Promise<OrderItem[]>;

  abstract save(orderItem: OrderItem): Promise<OrderItem>;
  abstract delete(orderItem: OrderItem): Promise<void>;
}
