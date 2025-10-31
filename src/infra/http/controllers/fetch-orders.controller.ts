import { Controller, BadRequestException, Get, Query } from '@nestjs/common';

import { z } from 'zod';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { FetchOrdersUseCase } from 'src/domain/orders/application/use-cases/fetch-orders';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { OrderPresenter } from '../presenters/order-presenter';
import { OrderStatus } from 'src/domain/orders/entities/order';

const fetchOrdersQuerySchema = z.object({
  pageIndex: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(20).default(20),
  status: z.enum(OrderStatus).optional(),
});
type FetchOrdersQuerySchema = z.infer<typeof fetchOrdersQuerySchema>;
const queryValidationPipe = new ZodValidationPipe(fetchOrdersQuerySchema);

@ApiTags('orders')
@Controller('/orders')
export class FetchOrdersController {
  constructor(private fetchOrders: FetchOrdersUseCase) {}

  @Get()
  @ApiSecurity('x-api-key')
  @ApiOperation({
    summary: 'Fetch all orders',
    description:
      'Retorna uma lista paginada de pedidos, com opção de filtrar por status',
  })
  @ApiQuery({
    name: 'pageIndex',
    required: false,
    description: 'Número da página (padrão: 1)',
    schema: { type: 'number', default: 1 },
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Quantidade de itens por página (máx: 20, padrão: 20)',
    schema: { type: 'number', default: 20 },
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar pedidos por status',
    schema: { type: 'string', enum: Object.values(OrderStatus) },
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos retornada com sucesso',
    schema: {
      example: {
        orders: [
          {
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
        ],
        meta: {
          pageIndex: 1,
          pageSize: 20,
          totalCount: 50,
          totalPages: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
    schema: { example: { message: 'Bad Request' } },
  })
  async handle(@Query(queryValidationPipe) query: FetchOrdersQuerySchema) {
    const { pageIndex, pageSize, status } = query;

    const result = await this.fetchOrders.execute({
      status,
      pageIndex,
      pageSize,
    });

    if (result.isLeft()) {
      return new BadRequestException();
    }

    const { orders, totalCount, totalPages } = result.value;

    return {
      orders: orders.map(OrderPresenter.toHTTP),
      meta: {
        pageIndex: pageIndex ?? 0,
        pageSize,
        totalCount,
        totalPages,
      },
    };
  }
}
