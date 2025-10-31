import {
  Controller,
  Body,
  HttpCode,
  Post,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { ReceiveOrderUseCase } from 'src/domain/orders/application/use-cases/receive-order';
import { ResourceAlreadyExists } from 'src/domain/orders/application/use-cases/@errors/resource-already-exists.error';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { OrderPresenter } from '../../presenters/order-presenter';
import { Currency } from 'src/core/types/currency';

export const receiveOrderBodySchema = z.object({
  order_id: z.string(),
  customer: z.object({
    email: z.string(),
    name: z.string(),
  }),
  items: z.array(
    z.object({
      sku: z.string(),
      qty: z.number(),
      unit_price: z.number(),
    }),
  ),
  currency: z.enum(Currency),
  idempotency_key: z.string(),
});

type ReceiveOrderBody = z.infer<typeof receiveOrderBodySchema>;
const bodyValidationPipe = new ZodValidationPipe(receiveOrderBodySchema);

@ApiTags('webhooks')
@Controller('/webhooks/orders')
export class ReceiveOrdersController {
  constructor(private receiveOrderUseCase: ReceiveOrderUseCase) {}

  @Post()
  @ApiSecurity('x-api-key')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Recebe novo pedido via webhook',
    description:
      'Recebe um pedido externo, garante idempotência, persiste no banco e enfileira para processamento',
  })
  @ApiBody({
    description: 'Payload do pedido recebido via webhook',
    schema: {
      example: {
        order_id: 'ext-123',
        customer: { email: 'user@example.com', name: 'Ana' },
        items: [{ sku: 'ABC123', qty: 2, unit_price: 59.9 }],
        currency: 'USD',
        idempotency_key: 'uuid-or-hash',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Pedido recebido e processado com sucesso',
    schema: { example: {} },
  })
  @ApiResponse({
    status: 409,
    description: 'Pedido já processado (idempotência)',
    schema: {
      example: {
        message: 'Order with idempotency key: uuid-or-hash already exists',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
    schema: { example: { message: 'Bad Request' } },
  })
  async handle(@Body(bodyValidationPipe) body: ReceiveOrderBody) {
    const result = await this.receiveOrderUseCase.execute(body);

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceAlreadyExists:
          return new ConflictException(error.message);
        default:
          return new BadRequestException(error.message);
      }
    }

    const order = result.value.order;

    return { order: OrderPresenter.toHTTP(order) };
  }
}
