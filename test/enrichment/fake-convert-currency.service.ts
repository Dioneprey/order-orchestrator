import { Currency } from 'src/core/types/currency';
import {
  ConvertCurrencyService,
  ProcessOrderParams,
} from 'src/domain/orders/application/enrichment/convert-currency.service';

export class FakeConvertCurrencyService extends ConvertCurrencyService {
  async convert({ fromCurrency, toCurrency }: ProcessOrderParams): Promise<{
    rate: number;
  }> {
    const bid = 5.5;

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
