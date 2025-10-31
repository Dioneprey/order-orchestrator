import { PaginationResponse } from 'src/core/types/pagination';
import {
  OrderRepository,
  OrderRepositoryFindByUniqueFieldProps,
  OrderRepositoryFindManyProps,
} from 'src/domain/orders/application/repositories/order.repository';
import { Order } from 'src/domain/orders/entities/order';

export class InMemoryOrderRepository implements OrderRepository {
  public items: Order[] = [];

  async findByUniqueField({
    key,
    value,
  }: OrderRepositoryFindByUniqueFieldProps): Promise<Order | null> {
    const order = this.items.find((item) => {
      const fieldValue = (item as any)[key];
      return String(fieldValue) === String(value);
    });

    return order ?? null;
  }

  async findMany({
    pageIndex = 1,
    pageSize = 10,
    filters,
  }: OrderRepositoryFindManyProps): Promise<PaginationResponse<Order>> {
    let orders = [...this.items];

    if (filters) {
      if (filters.status) {
        orders = orders.filter((o) => o.status === filters.status);
      }
    }

    const start = (pageIndex - 1) * pageSize;
    const paginated = orders.slice(start, start + pageSize);

    const totalCount = orders.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: paginated,
      pageIndex,
      totalCount,
      totalPages: totalPages,
    };
  }

  async create(order: Order): Promise<Order> {
    this.items.push(order);
    return order;
  }

  async save(order: Order): Promise<Order> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === order.id.toString(),
    );

    if (index === -1) {
      throw new Error('Order not found');
    }

    this.items[index] = order;
    return order;
  }

  async delete(order: Order): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === order.id.toString(),
    );

    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }
}
