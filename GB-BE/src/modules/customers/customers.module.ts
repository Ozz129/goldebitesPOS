import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CustomersController } from './controllers/customers.controller';
import { CustomersRepository } from './repositories/customers.repository';
import { CUSTOMERS_REPOSITORY } from './repositories/customers.repository.interface';
import { CustomersService } from './services/customers.service';

@Module({
  imports: [AuditModule],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    { provide: CUSTOMERS_REPOSITORY, useClass: CustomersRepository },
  ],
  exports: [CustomersService],
})
export class CustomersModule {}
