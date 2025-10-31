import { Currency } from 'src/core/types/currency';

export interface ProcessOrderParams {
  fromCurrency: Currency;
  toCurrency: Currency;
}

export abstract class ConvertCurrencyService {
  abstract convert(data: ProcessOrderParams): Promise<{
    rate: number;
  }>;
}
