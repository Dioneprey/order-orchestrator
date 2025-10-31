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
  OrderRepositoryFindManyProps,
} from 'src/domain/orders/application/repositories/order.repository';
import { Order, OrderKey } from 'src/domain/orders/entities/order';
import { Order as PrismaOrder } from '@generated/index';
import { buildCacheKey } from 'src/core/helpers/buid-cache-key';
import { PaginationResponse } from 'src/core/types/pagination';

const orderKeys: OrderKey[] = ['id', 'externalId', 'idempotencyKey'];

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(
    private prisma: PrismaService,
    private redisRepository: RedisRepository,
  ) {}
  async findByUniqueField({
    key,
    value,
    include,
  }: OrderRepositoryFindByUniqueFieldProps) {
    const cacheKey = buildCacheKey({
      baseKey: `order:${key}:${value}`,
      include,
    });
    const cached = await this.redisRepository.get<OrderWithInclude>(cacheKey);

    if (cached) {
      return PrismaOrderMapper.toDomain(cached);
    }

    const prismaOrder = await this.prisma.order.findFirst({
      where: {
        [key]: value,
      },
      include,
    });

    if (!prismaOrder) {
      return null;
    }

    await this.redisRepository.set(cacheKey, prismaOrder, 180);

    return PrismaOrderMapper.toDomain(prismaOrder);
  }

  async findMany({
    filters,
    pageIndex,
    pageSize,
    include,
  }: OrderRepositoryFindManyProps) {
    const cacheKey = buildCacheKey({
      baseKey: `order:all:${pageIndex}:${pageSize}`,
      filters,
      include,
    });
    const cached =
      await this.redisRepository.get<PaginationResponse<PrismaOrder>>(cacheKey);

    if (cached) {
      return {
        ...cached,
        data: cached.data.map(PrismaOrderMapper.toDomain),
      };
    }

    const [orders, totalCount] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          ...(filters?.status && {
            status: filters.status,
          }),
        },
        orderBy: { createdAt: 'desc' },
        ...(pageIndex && pageSize
          ? {
              skip: (pageIndex - 1) * pageSize,
              take: pageSize,
            }
          : {}),
        include,
      }),
      this.prisma.order.count({
        where: {
          ...(filters?.status && {
            status: filters.status,
          }),
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / 10);

    const paginatedResponsed = {
      data: orders,
      pageIndex,
      totalCount,
      totalPages,
    };

    await this.redisRepository.set(cacheKey, paginatedResponsed, 180);

    return {
      ...paginatedResponsed,
      data: orders.map(PrismaOrderMapper.toDomain),
    };
  }

  async create(order: Order) {
    const data = PrismaOrderMapper.toPrisma(order);

    const createdOrder = await this.prisma.order.create({
      data,
    });

    const promises: Promise<any>[] = [];

    promises.push(this.redisRepository.purgeByPrefix(`order:all`));

    await Promise.all(promises);

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

    const promises: Promise<any>[] = [];

    orderKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(`order:${key}:${data[key]}`),
      );
    });

    promises.push(this.redisRepository.purgeByPrefix(`order:all`));

    await Promise.all(promises);

    return PrismaOrderMapper.toDomain(updatedOrder);
  }

  async delete(order: Order): Promise<void> {
    const data = PrismaOrderMapper.toPrisma(order);

    await this.prisma.order.delete({
      where: {
        id: data.id,
      },
    });

    const promises: Promise<any>[] = [];

    orderKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(`order:${key}:${data[key]}`),
      );
    });

    promises.push(this.redisRepository.purgeByPrefix(`order:all`));

    await Promise.all(promises);
  }
}
