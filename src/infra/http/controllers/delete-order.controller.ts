import {
  Controller,
  HttpCode,
  Delete,
  BadRequestException,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { DeleteOrderUseCase } from 'src/domain/orders/application/use-cases/delete-order';
import { ResourceNotFoundError } from 'src/domain/orders/application/use-cases/@errors/resource-not-found.error';

@ApiTags('orders')
@Controller('/orders/:orderId')
export class DeleteOrdersController {
  constructor(private deleteOrderUseCase: DeleteOrderUseCase) {}

  @Delete()
  @ApiSecurity('x-api-key')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Excluir um pedido existente',
    description:
      'Exclui um pedido pelo ID. Atualiza o banco de dados e garante idempotência.',
  })
  @ApiParam({
    name: 'orderId',
    description: 'ID do pedido que será excluído',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Pedido excluído com sucesso (sem conteúdo)',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado',
    schema: { example: { message: 'Order with id: 123 does not exist.' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
  })
  async handle(@Param('orderId') orderId: string) {
    const result = await this.deleteOrderUseCase.execute({
      orderId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return {};
  }
}
