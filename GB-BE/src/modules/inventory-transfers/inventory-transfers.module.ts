import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BranchesModule } from '../branches/branches.module';
import { InventoryItemsModule } from '../inventory-items/inventory-items.module';
import { InventoryMovementsModule } from '../inventory-movements/inventory-movements.module';
import { InventoryTransfersController } from './controllers/inventory-transfers.controller';
import { InventoryTransfersRepository } from './repositories/inventory-transfers.repository';
import { INVENTORY_TRANSFERS_REPOSITORY } from './repositories/inventory-transfers.repository.interface';
import { InventoryTransfersService } from './services/inventory-transfers.service';

@Module({
  imports: [
    BranchesModule,
    InventoryItemsModule,
    InventoryMovementsModule,
    AuditModule,
  ],
  controllers: [InventoryTransfersController],
  providers: [
    InventoryTransfersService,
    {
      provide: INVENTORY_TRANSFERS_REPOSITORY,
      useClass: InventoryTransfersRepository,
    },
  ],
  exports: [InventoryTransfersService, INVENTORY_TRANSFERS_REPOSITORY],
})
export class InventoryTransfersModule {}
