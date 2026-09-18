import { Injectable } from '@nestjs/common';
import { BusinessesService } from '../../businesses/services/businesses.service';
import { ProductCategoriesService } from '../../product-categories/services/product-categories.service';
import { ProductsService } from '../../products/services/products.service';
import { PublicMenu, PublicMenuCategory, PublicMenuProduct } from '../domain/public-menu.interface';

const UNCATEGORIZED_LABEL = 'Otros';

@Injectable()
export class PublicMenuService {
  constructor(
    private readonly businessesService: BusinessesService,
    private readonly productCategoriesService: ProductCategoriesService,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Live, always-current menu (no "generate" step) — reflects whatever
   * products/categories are active right now. No @Permissions()/@RequiresFeature()
   * here: this endpoint is @Public(), there's no request.user to check them against.
   */
  async getMenu(businessId: string): Promise<PublicMenu> {
    const business = await this.businessesService.findById(businessId);

    const [categoriesResult, productsResult] = await Promise.all([
      this.productCategoriesService.findAll({ businessId, isActive: true, page: 1, limit: 200 }),
      this.productsService.findAll({ businessId, isActive: true, page: 1, limit: 500 }),
    ]);

    const productsByCategory = new Map<string | null, PublicMenuProduct[]>();
    for (const product of productsResult.data) {
      const key = product.categoryId;
      const list = productsByCategory.get(key) ?? [];
      list.push({
        id: product.id,
        name: product.name,
        salePrice: product.salePrice,
        description: product.description,
      });
      productsByCategory.set(key, list);
    }
    for (const list of productsByCategory.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    // categoriesResult.data is already ordered by display_order, name.
    const categories: PublicMenuCategory[] = categoriesResult.data
      .map((category) => ({
        id: category.id,
        name: category.name,
        products: productsByCategory.get(category.id) ?? [],
      }))
      .filter((category) => category.products.length > 0);

    const uncategorized = productsByCategory.get(null) ?? [];
    if (uncategorized.length > 0) {
      categories.push({ id: null, name: UNCATEGORIZED_LABEL, products: uncategorized });
    }

    return { businessName: business.name, categories };
  }
}
