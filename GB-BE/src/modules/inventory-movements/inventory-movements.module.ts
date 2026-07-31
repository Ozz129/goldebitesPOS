import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BranchesModule } from '../branches/branches.module';
import { InventoryItemsModule } from '../inventory-items/inventory-items.module';
import { InventoryMovementsController } from './controllers/inventory-movements.controller';
import { InventoryMovementsRepository } from './repositories/inventory-movements.repository';
import { INVENTORY_MOVEMENTS_REPOSITORY } from './repositories/inventory-movements.repository.interface';
import { InventoryMovementsService } from './services/inventory-movements.service';

@Module({
  imports: [InventoryItemsModule, BranchesModule, AuditModule],
  controllers: [InventoryMovementsController],
  providers: [
    InventoryMovementsService,
    {
      provide: INVENTORY_MOVEMENTS_REPOSITORY,
      useClass: InventoryMovementsRepository,
    },
  ],
  exports: [InventoryMovementsService, INVENTORY_MOVEMENTS_REPOSITORY],
})
export class InventoryMovementsModule {}
