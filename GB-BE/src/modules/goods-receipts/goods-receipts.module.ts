import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { InventoryItemsModule } from '../inventory-items/inventory-items.module';
import { InventoryMovementsModule } from '../inventory-movements/inventory-movements.module';
import { PurchasesModule } from '../purchases/purchases.module';
import { GoodsReceiptsController } from './controllers/goods-receipts.controller';
import { GoodsReceiptsRepository } from './repositories/goods-receipts.repository';
import { GOODS_RECEIPTS_REPOSITORY } from './repositories/goods-receipts.repository.interface';
import { GoodsReceiptsService } from './services/goods-receipts.service';

@Module({
  imports: [
    PurchasesModule,
    InventoryItemsModule,
    InventoryMovementsModule,
    AuditModule,
  ],
  controllers: [GoodsReceiptsController],
  providers: [
    GoodsReceiptsService,
    { provide: GOODS_RECEIPTS_REPOSITORY, useClass: GoodsReceiptsRepository },
  ],
  exports: [GoodsReceiptsService],
})
export class GoodsReceiptsModule {}
