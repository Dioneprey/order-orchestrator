import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { RedisRepository } from '../../redis/redis.service';
import {
  PrismaOrderMapper,
  OrderWithInclude,
} from '../mappers/prisma-order-mapper';
import {
  OrderRepository,
  OrderRepositoryFindByUniqueFieldProps,
} from 'src/domain/orders/application/repositories/order.repository';
import { Order } from 'src/domain/orders/entities/order';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(
    private prisma: PrismaService,
    private redisRepository: RedisRepository,
  ) {}
  async findByUniqueField({
    key,
    value,
  }: OrderRepositoryFindByUniqueFieldProps) {
    const cacheKey = `order:${key}:${value}`;
    const cached = await this.redisRepository.get<OrderWithInclude>(cacheKey);

    if (cached) {
      return PrismaOrderMapper.toDomain(cached);
    }

    const prismaOrder = await this.prisma.order.findFirst({
      where: {
        [key]: value,
      },
      include: {
        items: true,
      },
    });

    if (!prismaOrder) {
      return null;
    }

    await this.redisRepository.set(cacheKey, prismaOrder, 180);

    return PrismaOrderMapper.toDomain(prismaOrder);
  }

  async create(order: Order) {
    const data = PrismaOrderMapper.toPrisma(order);

    const createdOrder = await this.prisma.order.create({
      data,
    });

    return PrismaOrderMapper.toDomain(createdOrder);
  }

  async save(order: Order) {
    const data = PrismaOrderMapper.toPrisma(order);

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    await Promise.all([
      ...Object.keys(updatedOrder).map((key) =>
        this.redisRepository.purgeByPrefix(`order:${key}:${updatedOrder[key]}`),
      ),
    ]);

    return PrismaOrderMapper.toDomain(updatedOrder);
  }

  async delete(order: Order): Promise<void> {
    const data = PrismaOrderMapper.toPrisma(order);

    await this.prisma.order.delete({
      where: {
        id: data.id,
      },
    });

    await Promise.all([
      ...Object.keys(data).map((key) =>
        this.redisRepository.purgeByPrefix(`order:${key}:${data[key]}`),
      ),
    ]);
  }
}
