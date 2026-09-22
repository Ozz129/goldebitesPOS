import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BranchesModule } from '../branches/branches.module';
import { TableNamesController } from './controllers/table-names.controller';
import { TableNamesRepository } from './repositories/table-names.repository';
import { TABLE_NAMES_REPOSITORY } from './repositories/table-names.repository.interface';
import { TableNamesService } from './services/table-names.service';

@Module({
  imports: [AuditModule, BranchesModule],
  controllers: [TableNamesController],
  providers: [
    TableNamesService,
    { provide: TABLE_NAMES_REPOSITORY, useClass: TableNamesRepository },
  ],
  exports: [TableNamesService],
})
export class TableNamesModule {}
