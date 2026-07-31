import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BranchesModule } from '../branches/branches.module';
import { InventoryItemsModule } from '../inventory-items/inventory-items.module';
import { InventoryMovementsModule } from '../inventory-movements/inventory-movements.module';
import { WasteRecordsController } from './controllers/waste-records.controller';
import { WasteRecordsRepository } from './repositories/waste-records.repository';
import { WASTE_RECORDS_REPOSITORY } from './repositories/waste-records.repository.interface';
import { WasteRecordsService } from './services/waste-records.service';

@Module({
  imports: [
    BranchesModule,
    InventoryItemsModule,
    InventoryMovementsModule,
    AuditModule,
  ],
  controllers: [WasteRecordsController],
  providers: [
    WasteRecordsService,
    { provide: WASTE_RECORDS_REPOSITORY, useClass: WasteRecordsRepository },
  ],
  exports: [WasteRecordsService],
})
export class WasteModule {}
