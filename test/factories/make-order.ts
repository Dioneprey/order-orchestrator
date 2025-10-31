import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Order, OrderProps } from 'src/domain/orders/entities/order';
import { faker } from '@faker-js/faker';
import { Currency } from 'src/core/types/currency';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { PrismaOrderMapper } from 'src/infra/database/prisma/mappers/prisma-order-mapper';
import { Injectable } from '@nestjs/common';

export function makeOrder(
  override: Partial<OrderProps> = {},
  id?: UniqueEntityID,
) {
  const order = Order.create(
    {
      externalId: override.externalId || new UniqueEntityID().toString(),
      customerEmail: override.customerEmail || faker.internet.email(),
      customerName: override.customerName || faker.person.firstName(),
      currency: override.currency || Currency.USD,
      idempotencyKey:
        override.idempotencyKey || new UniqueEntityID().toString(),
      baseAmount: override.baseAmount || faker.number.float(),
      ...override,
    },
    id,
  );

  return order;
}

@Injectable()
export class OrderFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaOrder(data: Partial<OrderProps> = {}): Promise<Order> {
    const order = makeOrder(data);

    await this.prisma.order.create({
      data: PrismaOrderMapper.toPrisma(order),
    });

    return order;
  }
}
