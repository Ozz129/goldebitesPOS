import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { KitchenController } from './controllers/kitchen.controller';
import { KitchenService } from './services/kitchen.service';

@Module({
  imports: [OrdersModule],
  controllers: [KitchenController],
  providers: [KitchenService],
})
export class KitchenModule {}
