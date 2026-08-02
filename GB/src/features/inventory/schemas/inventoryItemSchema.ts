import { z } from 'zod';

/** Mirrors GB-BE's CreateInventoryItemDto/UpdateInventoryItemDto. */
export const inventoryItemSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(2, 'Ingresa un nombre válido').max(150),
  sku: z.string().max(60).optional(),
  unit: z.string().min(1, 'Ingresa una unidad de medida').max(30),
  minimumStock: z.coerce.number().min(0).optional(),
  currentCost: z.coerce.number().min(0).optional(),
  serialNumber: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
});

export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;
