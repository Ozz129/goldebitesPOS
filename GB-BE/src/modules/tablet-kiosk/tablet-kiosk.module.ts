import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsModule } from '../payments/payments.module';
import { ProductCategoriesModule } from '../product-categories/product-categories.module';
import { ProductsModule } from '../products/products.module';
import { TabletKioskController } from './controllers/tablet-kiosk.controller';

@Module({
  imports: [
    OrdersModule,
    ProductsModule,
    ProductCategoriesModule,
    PaymentsModule,
  ],
  controllers: [TabletKioskController],
})
export class TabletKioskModule {}
