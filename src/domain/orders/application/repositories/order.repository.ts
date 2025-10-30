import { Order, OrderKey } from '../../entities/order';

export interface OrderRepositoryFindByUniqueFieldProps {
  key: OrderKey;
  value: string;
}

export abstract class OrderRepository {
  abstract findByUniqueField({
    key,
    value,
  }: OrderRepositoryFindByUniqueFieldProps): Promise<Order | null>;

  abstract create(order: Order): Promise<Order>;
  abstract save(order: Order): Promise<Order>;
  abstract delete(order: Order): Promise<void>;
}
