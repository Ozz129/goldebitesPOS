import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { ExpensesController } from './controllers/expenses.controller';
import { ExpensesRepository } from './repositories/expenses.repository';
import { EXPENSES_REPOSITORY } from './repositories/expenses.repository.interface';
import { ExpensesService } from './services/expenses.service';

@Module({
  imports: [AuditModule],
  controllers: [ExpensesController],
  providers: [
    ExpensesService,
    { provide: EXPENSES_REPOSITORY, useClass: ExpensesRepository },
  ],
})
export class FinancesModule {}
