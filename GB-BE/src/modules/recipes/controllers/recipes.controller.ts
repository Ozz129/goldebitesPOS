import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../../common/decorators/current-business.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RawResponse } from '../../../common/decorators/raw-response.decorator';
import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { SetRecipeItemsDto } from '../dto/set-recipe-items.dto';
import { UpdateRecipeDto } from '../dto/update-recipe.dto';
import { RecipesService } from '../services/recipes.service';

@ApiTags('Recipes')
@ApiBearerAuth()
@Controller('products/:productId/recipe')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @Permissions('products.update')
  @ApiOperation({ summary: "Create a product's recipe (bill of materials)" })
  create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('productId') productId: string,
    @Body() dto: CreateRecipeDto,
  ) {
    return this.recipesService.create(
      {
        businessId,
        productId,
        name: dto.name,
        yieldQuantity: dto.yieldQuantity,
        instructions: dto.instructions,
      },
      dto.items,
      actorUserId,
    );
  }

  @Get()
  @Permissions('products.read')
  @ApiOperation({ summary: 'Get a recipe with its items and computed cost' })
  findByProduct(
    @CurrentBusiness() businessId: string,
    @Param('productId') productId: string,
  ) {
    return this.recipesService.findByProduct(businessId, productId);
  }

  @Patch()
  @Permissions('products.update')
  @ApiOperation({ summary: 'Update recipe name, yield or instructions' })
  update(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(businessId, productId, dto, actorUserId);
  }

  @Put('items')
  @Permissions('products.update')
  @ApiOperation({
    summary:
      'Replace the full set of ingredients (also recalculates product cost)',
  })
  setItems(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('productId') productId: string,
    @Body() dto: SetRecipeItemsDto,
  ) {
    return this.recipesService.setItems(
      businessId,
      productId,
      dto.items,
      actorUserId,
    );
  }

  @Delete()
  @Permissions('products.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RawResponse()
  @ApiOperation({ summary: 'Delete a recipe' })
  async remove(
    @CurrentBusiness() businessId: string,
    @CurrentUser('userId') actorUserId: string,
    @Param('productId') productId: string,
  ) {
    await this.recipesService.remove(businessId, productId, actorUserId);
  }
}
