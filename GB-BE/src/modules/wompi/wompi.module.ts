import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsModule } from '../payments/payments.module';
import { WompiController } from './controllers/wompi.controller';
import { WompiEnabledGuard } from './guards/wompi-enabled.guard';
import { WompiIntentsRepository } from './repositories/wompi-intents.repository';
import { WOMPI_INTENTS_REPOSITORY } from './repositories/wompi-intents.repository.interface';
import { WompiService } from './services/wompi.service';

@Module({
  imports: [OrdersModule, PaymentsModule],
  controllers: [WompiController],
  providers: [
    WompiService,
    WompiEnabledGuard,
    { provide: WOMPI_INTENTS_REPOSITORY, useClass: WompiIntentsRepository },
  ],
  exports: [WompiService],
})
export class WompiModule {}
