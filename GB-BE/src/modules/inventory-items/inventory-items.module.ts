import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { InventoryItemsController } from './controllers/inventory-items.controller';
import { InventoryItemsRepository } from './repositories/inventory-items.repository';
import { INVENTORY_ITEMS_REPOSITORY } from './repositories/inventory-items.repository.interface';
import { InventoryItemsService } from './services/inventory-items.service';

@Module({
  imports: [AuditModule],
  controllers: [InventoryItemsController],
  providers: [
    InventoryItemsService,
    { provide: INVENTORY_ITEMS_REPOSITORY, useClass: InventoryItemsRepository },
  ],
  exports: [InventoryItemsService, INVENTORY_ITEMS_REPOSITORY],
})
export class InventoryItemsModule {}
