import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { InventoryItemsModule } from '../inventory-items/inventory-items.module';
import { ProductsModule } from '../products/products.module';
import { RecipesController } from './controllers/recipes.controller';
import { RecipesRepository } from './repositories/recipes.repository';
import { RECIPES_REPOSITORY } from './repositories/recipes.repository.interface';
import { RecipesService } from './services/recipes.service';

@Module({
  imports: [ProductsModule, InventoryItemsModule, AuditModule],
  controllers: [RecipesController],
  providers: [
    RecipesService,
    { provide: RECIPES_REPOSITORY, useClass: RecipesRepository },
  ],
  exports: [RecipesService, RECIPES_REPOSITORY],
})
export class RecipesModule {}
