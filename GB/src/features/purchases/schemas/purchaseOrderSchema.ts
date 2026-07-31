import { z } from 'zod';

export const purchaseOrderLineSchema = z.object({
  inventoryItemId: z.string().min(1, 'Selecciona un insumo'),
  quantity: z.coerce.number().positive('Cantidad inválida'),
  unitCost: z.coerce.number().min(0, 'El costo no puede ser negativo'),
});

/** Mirrors GB-BE's CreatePurchaseOrderDto. */
export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Selecciona un proveedor'),
  expectedDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(purchaseOrderLineSchema).min(1, 'Agrega al menos un insumo'),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;
