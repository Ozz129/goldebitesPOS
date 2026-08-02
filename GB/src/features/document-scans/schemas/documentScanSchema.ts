import { z } from 'zod';

/** Mirrors GB-BE's CreateDocumentScanDto/UpdateDocumentScanDto text fields — the file itself is handled separately (see DocumentScanFormDrawer). */
export const documentScanSchema = z.object({
  title: z.string().min(2, 'Ingresa un título').max(150),
  category: z.enum(['invoice', 'receipt', 'other']),
  documentDate: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export type DocumentScanFormValues = z.infer<typeof documentScanSchema>;
