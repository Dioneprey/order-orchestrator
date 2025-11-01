import { Module } from '@nestjs/common';
import { ExternalConvertCurrencyService } from './external-convert-currency.service';
import { ConvertCurrencyService } from 'src/domain/orders/application/enrichment/convert-currency.service';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [HttpModule, DatabaseModule],
  providers: [
    {
      provide: ConvertCurrencyService,
      useClass: ExternalConvertCurrencyService,
    },
  ],
  exports: [ConvertCurrencyService],
})
export class EnrichmentModule {}
