import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CashSessionsModule } from '../cash-sessions/cash-sessions.module';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsRepository } from './repositories/payments.repository';
import { PAYMENTS_REPOSITORY } from './repositories/payments.repository.interface';
import { PaymentsService } from './services/payments.service';

@Module({
  imports: [OrdersModule, CashSessionsModule, AuditModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    { provide: PAYMENTS_REPOSITORY, useClass: PaymentsRepository },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
