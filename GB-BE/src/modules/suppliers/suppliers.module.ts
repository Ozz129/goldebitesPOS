import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { SuppliersController } from './controllers/suppliers.controller';
import { SuppliersRepository } from './repositories/suppliers.repository';
import { SUPPLIERS_REPOSITORY } from './repositories/suppliers.repository.interface';
import { SuppliersService } from './services/suppliers.service';

@Module({
  imports: [AuditModule],
  controllers: [SuppliersController],
  providers: [
    SuppliersService,
    { provide: SUPPLIERS_REPOSITORY, useClass: SuppliersRepository },
  ],
  exports: [SuppliersService, SUPPLIERS_REPOSITORY],
})
export class SuppliersModule {}
