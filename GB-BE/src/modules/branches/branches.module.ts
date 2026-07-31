import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BranchesController } from './controllers/branches.controller';
import { BranchesRepository } from './repositories/branches.repository';
import { BRANCHES_REPOSITORY } from './repositories/branches.repository.interface';
import { BranchesService } from './services/branches.service';

@Module({
  imports: [AuditModule],
  controllers: [BranchesController],
  providers: [
    BranchesService,
    { provide: BRANCHES_REPOSITORY, useClass: BranchesRepository },
  ],
  exports: [BranchesService, BRANCHES_REPOSITORY],
})
export class BranchesModule {}
