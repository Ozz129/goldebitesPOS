import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BranchesModule } from '../branches/branches.module';
import { InventoryItemsModule } from '../inventory-items/inventory-items.module';
import { InventoryMovementsModule } from '../inventory-movements/inventory-movements.module';
import { InventoryCountsController } from './controllers/inventory-counts.controller';
import { InventoryCountsRepository } from './repositories/inventory-counts.repository';
import { INVENTORY_COUNTS_REPOSITORY } from './repositories/inventory-counts.repository.interface';
import { InventoryCountsService } from './services/inventory-counts.service';

@Module({
  imports: [
    BranchesModule,
    InventoryItemsModule,
    InventoryMovementsModule,
    AuditModule,
  ],
  controllers: [InventoryCountsController],
  providers: [
    InventoryCountsService,
    {
      provide: INVENTORY_COUNTS_REPOSITORY,
      useClass: InventoryCountsRepository,
    },
  ],
  exports: [InventoryCountsService, INVENTORY_COUNTS_REPOSITORY],
})
export class InventoryCountsModule {}
