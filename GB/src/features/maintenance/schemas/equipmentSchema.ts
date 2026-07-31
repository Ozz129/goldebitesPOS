import { z } from 'zod';

/** Mirrors GB-BE's CreateEquipmentDto/UpdateEquipmentDto. */
export const equipmentSchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre').max(150),
  serialNumber: z.string().max(100).optional(),
  purchaseDate: z.string().optional(),
  warrantyUntil: z.string().optional(),
  technicalSupplier: z.string().max(150).optional(),
  nextMaintenanceAt: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export type EquipmentFormValues = z.infer<typeof equipmentSchema>;
