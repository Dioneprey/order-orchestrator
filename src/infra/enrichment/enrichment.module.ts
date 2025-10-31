import { Module } from '@nestjs/common';
import { ExternalConvertCurrencyService } from './external-convert-currency.service';
import { ConvertCurrencyService } from 'src/domain/orders/application/enrichment/convert-currency.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: ConvertCurrencyService,
      useClass: ExternalConvertCurrencyService,
    },
  ],
  exports: [ConvertCurrencyService],
})
export class EnrichmentModule {}
