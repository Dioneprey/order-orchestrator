import { PaginationProps, PaginationResponse } from 'src/core/types/pagination';
import { Order, OrderKey, OrderStatus } from '../../entities/order';

export interface OrderRepositoryFindByUniqueFieldProps {
  key: OrderKey;
  value: string;
  include?: {
    items?: boolean;
  };
}

export interface OrderRepositoryFindManyProps
  extends PaginationProps<{
    status?: OrderStatus;
  }> {
  include?: {
    items?: boolean;
  };
}

export abstract class OrderRepository {
  abstract findByUniqueField({
    key,
    value,
    include,
  }: OrderRepositoryFindByUniqueFieldProps): Promise<Order | null>;

  abstract findMany({
    pageIndex,
    pageSize,
    filters,
  }: OrderRepositoryFindManyProps): Promise<PaginationResponse<Order>>;

  abstract create(order: Order): Promise<Order>;
  abstract save(order: Order): Promise<Order>;
  abstract delete(order: Order): Promise<void>;
}
