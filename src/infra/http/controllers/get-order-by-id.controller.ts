import {
  Controller,
  BadRequestException,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { OrderPresenter } from '../presenters/order-presenter';
import { GetOrderByIdUseCase } from 'src/domain/orders/application/use-cases/get-order-by-id';
import { ResourceNotFoundError } from 'src/domain/orders/application/use-cases/@errors/resource-not-found.error';

@ApiTags('orders')
@Controller('/orders/:orderId')
export class GetOrderByIdController {
  constructor(private getOrderById: GetOrderByIdUseCase) {}

  @Get()
  @ApiSecurity('x-api-key')
  @ApiOperation({
    summary: 'Busca um pedido por ID',
    description:
      'Retorna os detalhes de um pedido específico pelo ID interno do banco',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedido retornado com sucesso',
    schema: {
      example: {
        order: {
          id: 'uuid-123',
          externalId: 'ext-123',
          customerName: 'Ana',
          customerEmail: 'user@example.com',
          currency: 'USD',
          baseAmount: 119.8,
          convertedAmount: 23.0,
          convertedCurrency: 'BRL',
          exchangeRate: 5.2,
          status: 'RECEIVED',
          createdAt: '2025-10-31T11:00:00Z',
          updatedAt: '2025-10-31T11:10:00Z',
          items: [
            {
              sku: 'ABC123',
              qty: 2,
              unitPrice: 59.9,
              convertedUnitPrice: 31.0,
              convertedCurrency: 'BRL',
              exchangeRate: 5.2,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado',
    schema: { example: { message: 'Order with id: 123, does not exist' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
    schema: { example: { message: 'Bad Request' } },
  })
  async handle(@Param('orderId') orderId: string) {
    const result = await this.getOrderById.execute({
      orderId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          return new NotFoundException(error.message);
        default:
          return new BadRequestException(error.message);
      }
    }

    const { order } = result.value;

    return {
      order: OrderPresenter.toHTTP(order),
    };
  }
}
