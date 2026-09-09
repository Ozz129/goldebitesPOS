export const recipeKeys = {
  all: ['recipes'] as const,
  byProduct: (productId: string) => [...recipeKeys.all, 'product', productId] as const,
};
