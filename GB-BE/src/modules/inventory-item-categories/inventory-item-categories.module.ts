import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { InventoryItemCategoriesController } from './controllers/inventory-item-categories.controller';
import { InventoryItemCategoriesRepository } from './repositories/inventory-item-categories.repository';
import { INVENTORY_ITEM_CATEGORIES_REPOSITORY } from './repositories/inventory-item-categories.repository.interface';
import { InventoryItemCategoriesService } from './services/inventory-item-categories.service';

@Module({
  imports: [AuditModule],
  controllers: [InventoryItemCategoriesController],
  providers: [
    InventoryItemCategoriesService,
    {
      provide: INVENTORY_ITEM_CATEGORIES_REPOSITORY,
      useClass: InventoryItemCategoriesRepository,
    },
  ],
  exports: [
    InventoryItemCategoriesService,
    INVENTORY_ITEM_CATEGORIES_REPOSITORY,
  ],
})
export class InventoryItemCategoriesModule {}
