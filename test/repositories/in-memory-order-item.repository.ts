import {
  OrderItemRepository,
  OrderItemRepositoryFindByUniqueFieldProps,
} from 'src/domain/orders/application/repositories/order-item.repository';
import { OrderItem } from 'src/domain/orders/entities/order-item';

export class InMemoryOrderItemRepository implements OrderItemRepository {
  public items: OrderItem[] = [];

  async findByUniqueField({
    key,
    value,
  }: OrderItemRepositoryFindByUniqueFieldProps): Promise<OrderItem | null> {
    const order = this.items.find((item) => {
      const fieldValue = (item as any)[key];
      return String(fieldValue) === String(value);
    });

    return order ?? null;
  }

  async createMany(orderItems: OrderItem[]): Promise<OrderItem[]> {
    orderItems.forEach((item) => this.items.push(item));

    return orderItems;
  }

  async saveMany(orderItems: OrderItem[]): Promise<OrderItem[]> {
    for (const item of orderItems) {
      const index = this.items.findIndex((i) => i.id === item.id);

      if (index !== -1) {
        // Atualiza item existente
        this.items[index] = item;
      } else {
        // Adiciona novo item
        this.items.push(item);
      }
    }

    return orderItems;
  }

  async save(orderItem: OrderItem): Promise<OrderItem> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === orderItem.id.toString(),
    );

    if (index === -1) {
      throw new Error('Order not found');
    }

    this.items[index] = orderItem;
    return orderItem;
  }

  async delete(orderItem: OrderItem): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === orderItem.id.toString(),
    );

    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }
}
