import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BranchesModule } from '../branches/branches.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { InventoryItemsModule } from '../inventory-items/inventory-items.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { PurchaseOrdersController } from './controllers/purchase-orders.controller';
import { PurchaseOrdersRepository } from './repositories/purchase-orders.repository';
import { PURCHASE_ORDERS_REPOSITORY } from './repositories/purchase-orders.repository.interface';
import { PurchaseOrdersService } from './services/purchase-orders.service';

@Module({
  imports: [
    BranchesModule,
    SuppliersModule,
    InventoryItemsModule,
    BusinessesModule,
    AuditModule,
  ],
  controllers: [PurchaseOrdersController],
  providers: [
    PurchaseOrdersService,
    { provide: PURCHASE_ORDERS_REPOSITORY, useClass: PurchaseOrdersRepository },
  ],
  exports: [PurchaseOrdersService, PURCHASE_ORDERS_REPOSITORY],
})
export class PurchasesModule {}
