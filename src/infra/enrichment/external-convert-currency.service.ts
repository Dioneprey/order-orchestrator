import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  ConvertCurrencyService,
  ProcessOrderParams,
} from 'src/domain/orders/application/enrichment/convert-currency.service';
import { Currency } from 'src/core/types/currency';
import { RedisRepository } from '../database/redis/redis.service';
import { buildCacheKey } from 'src/core/helpers/buid-cache-key';

export interface CurrencyQuote {
  code: Currency; // moeda base
  codein: Currency; // moeda alvo
  name: string; // descrição
  high: string; // máxima do dia (string da API)
  low: string; // mínima do dia
  varBid: string; // variação absoluta
  pctChange: string; // variação percentual
  bid: string; // valor de compra
  ask: string; // valor de venda
  timestamp: string; // timestamp unix
  create_date: string; // data de criação da cotação
}

export interface CurrencyApiResponse {
  USDBRL: CurrencyQuote; // por enquanto só USD → BRL
}

@Injectable()
export class ExternalConvertCurrencyService implements ConvertCurrencyService {
  private readonly logger = new Logger(ExternalConvertCurrencyService.name);
  constructor(
    private httpService: HttpService,
    private redisRepository: RedisRepository,
  ) {}

  async convert({ fromCurrency, toCurrency }: ProcessOrderParams): Promise<{
    rate: number;
  }> {
    const cacheKey = buildCacheKey({
      baseKey: `current-exchange-rate`,
    });

    let data: CurrencyApiResponse | null = null;

    const cached =
      await this.redisRepository.get<CurrencyApiResponse>(cacheKey);

    if (cached) {
      data = cached;
    } else {
      const { data: responseData } = await firstValueFrom(
        this.httpService
          .get<CurrencyApiResponse>(
            'https://economia.awesomeapi.com.br/json/last/USD',
          )
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error?.response?.data);
              throw error;
            }),
          ),
      );

      const TEN_MINUTES_IN_SECONDS = 60 * 10;

      await this.redisRepository.set(
        cacheKey,
        responseData,
        TEN_MINUTES_IN_SECONDS,
      );

      data = responseData;
    }

    const bid = parseFloat(data.USDBRL.bid);

    let rate: number;

    if (fromCurrency === toCurrency) {
      rate = 1;
    } else if (fromCurrency === Currency.USD && toCurrency === Currency.BRL) {
      rate = bid;
    } else if (fromCurrency === Currency.BRL && toCurrency === Currency.USD) {
      rate = 1 / bid;
    } else {
      throw new Error(
        `Par de moedas não suportado: ${fromCurrency} → ${toCurrency}`,
      );
    }

    return { rate };
  }
}
