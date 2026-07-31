import { z } from 'zod';

/** Mirrors GB-BE's CreateProductDto/UpdateProductDto. */
export const productSchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre válido').max(150),
  categoryId: z.string().optional(),
  description: z.string().max(2000).optional(),
  sku: z.string().max(60).optional(),
  salePrice: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  trackInventory: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
