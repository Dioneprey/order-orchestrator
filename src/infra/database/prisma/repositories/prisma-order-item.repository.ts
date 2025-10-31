import { Injectable } from '@nestjs/common';
import { OrderItem as PrismaOrderItem } from '@generated/index';
import { PrismaService } from '../prisma.service';
import { RedisRepository } from '../../redis/redis.service';
import {
  OrderItemRepository,
  OrderItemRepositoryFindByUniqueFieldProps,
} from 'src/domain/orders/application/repositories/order-item.repository';
import { PrismaOrderItemMapper } from '../mappers/prisma-order-item-mapper';
import { OrderItem, OrderItemKey } from 'src/domain/orders/entities/order-item';
import { buildCacheKey } from 'src/core/helpers/buid-cache-key';
import { OrderKey } from 'src/domain/orders/entities/order';

const orderKeys: OrderKey[] = ['id', 'externalId', 'idempotencyKey'];

@Injectable()
export class PrismaOrderItemRepository implements OrderItemRepository {
  constructor(
    private prisma: PrismaService,
    private redisRepository: RedisRepository,
  ) {}
  async findByUniqueField({
    key,
    value,
  }: OrderItemRepositoryFindByUniqueFieldProps) {
    const cacheKey = buildCacheKey({
      baseKey: `order-item:${key}:${value}`,
    });

    const cached = await this.redisRepository.get<PrismaOrderItem>(cacheKey);

    if (cached) {
      return PrismaOrderItemMapper.toDomain(cached);
    }

    const prismaOrderItem = await this.prisma.orderItem.findFirst({
      where: {
        [key]: value,
      },
    });

    if (!prismaOrderItem) {
      return null;
    }

    await this.redisRepository.set(cacheKey, prismaOrderItem, 180);

    return PrismaOrderItemMapper.toDomain(prismaOrderItem);
  }

  async createMany(orderItems: OrderItem[]) {
    const items = orderItems.map(PrismaOrderItemMapper.toPrisma);

    await this.prisma.orderItem.createMany({
      data: items,
    });

    const orderItemKeys: OrderItemKey[] = ['id'];

    const promises: Promise<any>[] = [];

    orderItems.forEach((item) => {
      orderItemKeys.forEach((key) => {
        promises.push(
          this.redisRepository.purgeByPrefix(`order-item:${key}:${item[key]}`),
        );
      });
    });

    promises.push(this.redisRepository.purgeByPrefix(`order:all`));

    const orderId = orderItems[0].orderId.toString();

    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (order) {
      orderKeys.forEach((key) => {
        promises.push(
          this.redisRepository.purgeByPrefix(`order:${key}:${order[key]}`),
        );
      });
    }

    await Promise.all(promises);

    return orderItems;
  }

  async saveMany(orderItems: OrderItem[]) {
    if (!orderItems.length) return [];

    const orderId = orderItems[0].orderId.toString();

    const items = orderItems.map(PrismaOrderItemMapper.toPrisma);

    await this.prisma.$transaction([
      this.prisma.orderItem.deleteMany({
        where: { orderId },
      }),
      this.prisma.orderItem.createMany({
        data: items,
      }),
    ]);

    const orderItemKeys: OrderItemKey[] = ['id'];

    const promises: Promise<any>[] = [];

    orderItems.forEach((item) => {
      orderItemKeys.forEach((key) => {
        promises.push(
          this.redisRepository.purgeByPrefix(`order-item:${key}:${item[key]}`),
        );
      });
    });

    promises.push(this.redisRepository.purgeByPrefix(`order:all`));

    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (order) {
      orderKeys.forEach((key) => {
        promises.push(
          this.redisRepository.purgeByPrefix(`order:${key}:${order[key]}`),
        );
      });
    }

    await Promise.all(promises);

    return orderItems;
  }

  async save(orderItem: OrderItem) {
    const data = PrismaOrderItemMapper.toPrisma(orderItem);

    const updatedOrderItem = await this.prisma.orderItem.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    const orderItemKeys: OrderItemKey[] = ['id'];
    const promises: Promise<any>[] = [];

    orderItemKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(
          `order-item:${key}:${updatedOrderItem[key]}`,
        ),
      );
    });

    promises.push(this.redisRepository.purgeByPrefix(`order:all`));

    const order = await this.prisma.order.findUnique({
      where: {
        id: data.orderId,
      },
    });

    if (order) {
      orderKeys.forEach((key) => {
        promises.push(
          this.redisRepository.purgeByPrefix(`order:${key}:${order[key]}`),
        );
      });
    }

    await Promise.all(promises);

    return PrismaOrderItemMapper.toDomain(updatedOrderItem);
  }

  async delete(orderItem: OrderItem): Promise<void> {
    const data = PrismaOrderItemMapper.toPrisma(orderItem);

    await this.prisma.orderItem.delete({
      where: {
        id: data.id,
      },
    });

    const orderItemKeys: OrderItemKey[] = ['id'];
    const promises: Promise<any>[] = [];

    orderItemKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(`order-item:${key}:${data[key]}`),
      );
    });

    promises.push(this.redisRepository.purgeByPrefix(`order:all`));

    const order = await this.prisma.order.findUnique({
      where: {
        id: data.orderId,
      },
    });

    if (order) {
      orderKeys.forEach((key) => {
        promises.push(
          this.redisRepository.purgeByPrefix(`order:${key}:${order[key]}`),
        );
      });
    }

    await Promise.all(promises);
  }
}
