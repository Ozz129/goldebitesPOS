import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { ProductCategoriesController } from './controllers/product-categories.controller';
import { ProductCategoriesRepository } from './repositories/product-categories.repository';
import { PRODUCT_CATEGORIES_REPOSITORY } from './repositories/product-categories.repository.interface';
import { ProductCategoriesService } from './services/product-categories.service';

@Module({
  imports: [AuditModule],
  controllers: [ProductCategoriesController],
  providers: [
    ProductCategoriesService,
    {
      provide: PRODUCT_CATEGORIES_REPOSITORY,
      useClass: ProductCategoriesRepository,
    },
  ],
  exports: [ProductCategoriesService, PRODUCT_CATEGORIES_REPOSITORY],
})
export class ProductCategoriesModule {}
