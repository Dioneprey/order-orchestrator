import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../public';
import { Reflector } from '@nestjs/core';
import { EnvService } from 'src/infra/env/env.service';

@Injectable()
export class ApiKeyAuthGuard {
  constructor(
    private reflector: Reflector,
    private envService: EnvService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const apiKeyHeader = (request.headers['x-api-key'] as string) || '';

    const expectedApiKey = this.envService.get('API_KEY');

    if (isPublic) {
      return true;
    }

    // Autenticação básica via API KEY pelo contexto de teste técnico
    if (!apiKeyHeader || apiKeyHeader !== expectedApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
