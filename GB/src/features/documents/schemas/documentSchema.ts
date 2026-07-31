import { z } from 'zod';

/** Mirrors GB-BE's CreateDocumentDto/UpdateDocumentDto. `fileName` is a free-text label only — no file is uploaded or stored. */
export const documentSchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre').max(150),
  category: z.string().min(2, 'Ingresa una categoría').max(100),
  issueDate: z.string().min(1, 'Selecciona una fecha de emisión'),
  expirationDate: z.string().optional(),
  responsible: z.string().max(150).optional(),
  fileName: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
});

export type DocumentFormValues = z.infer<typeof documentSchema>;
