import { Module } from '@nestjs/common';
import { BusinessesModule } from '../businesses/businesses.module';
import { ProductCategoriesModule } from '../product-categories/product-categories.module';
import { ProductsModule } from '../products/products.module';
import { PublicMenuController } from './controllers/public-menu.controller';
import { PublicMenuService } from './services/public-menu.service';

@Module({
  imports: [BusinessesModule, ProductCategoriesModule, ProductsModule],
  controllers: [PublicMenuController],
  providers: [PublicMenuService],
})
export class PublicMenuModule {}
