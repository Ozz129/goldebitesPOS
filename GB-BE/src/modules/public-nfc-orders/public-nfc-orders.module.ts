import { Module } from '@nestjs/common';
import { NfcTagsModule } from '../nfc-tags/nfc-tags.module';
import { OrdersModule } from '../orders/orders.module';
import { PublicNfcOrdersController } from './controllers/public-nfc-orders.controller';
import { NfcOrderSubmissionsRepository } from './repositories/nfc-order-submissions.repository';
import { NFC_ORDER_SUBMISSIONS_REPOSITORY } from './repositories/nfc-order-submissions.repository.interface';
import { PublicNfcOrdersService } from './services/public-nfc-orders.service';

@Module({
  imports: [NfcTagsModule, OrdersModule],
  controllers: [PublicNfcOrdersController],
  providers: [
    PublicNfcOrdersService,
    {
      provide: NFC_ORDER_SUBMISSIONS_REPOSITORY,
      useClass: NfcOrderSubmissionsRepository,
    },
  ],
})
export class PublicNfcOrdersModule {}
