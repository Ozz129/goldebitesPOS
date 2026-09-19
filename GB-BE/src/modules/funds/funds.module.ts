import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BranchesModule } from '../branches/branches.module';
import { FundsController } from './controllers/funds.controller';
import { FundsRepository } from './repositories/funds.repository';
import { FUNDS_REPOSITORY } from './repositories/funds.repository.interface';
import { FundsService } from './services/funds.service';

@Module({
  imports: [AuditModule, BranchesModule],
  controllers: [FundsController],
  providers: [
    FundsService,
    { provide: FUNDS_REPOSITORY, useClass: FundsRepository },
  ],
  exports: [FundsService],
})
export class FundsModule {}
