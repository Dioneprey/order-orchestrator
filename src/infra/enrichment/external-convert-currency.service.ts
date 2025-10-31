import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  ConvertCurrencyService,
  ProcessOrderParams,
} from 'src/domain/orders/application/enrichment/convert-currency.service';
import { Currency } from 'src/core/types/currency';

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
  constructor(private httpService: HttpService) {}

  async convert({ fromCurrency, toCurrency }: ProcessOrderParams): Promise<{
    rate: number;
  }> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<any>('https://economia.awesomeapi.com.br/json/last/USD')
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error?.response?.data);
            throw error;
          }),
        ),
    );

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
