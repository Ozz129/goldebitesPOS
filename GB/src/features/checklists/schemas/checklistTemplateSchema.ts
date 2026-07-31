import { z } from 'zod';

/** Mirrors GB-BE's CreateChecklistTemplateDto/UpdateChecklistTemplateDto (name/type only — items are managed separately). */
export const checklistTemplateSchema = z.object({
  type: z.enum(['OPENING', 'CLOSING']),
  name: z.string().min(2, 'Ingresa un nombre').max(150),
});

export type ChecklistTemplateFormValues = z.infer<typeof checklistTemplateSchema>;
