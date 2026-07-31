import { PartialType } from '@nestjs/swagger';
import { CreateInventoryItemCategoryDto } from './create-inventory-item-category.dto';

export class UpdateInventoryItemCategoryDto extends PartialType(
  CreateInventoryItemCategoryDto,
) {}
