import { z } from 'zod';

/** Mirrors GB-BE's CreateContentItemDto/UpdateContentItemDto. */
export const contentItemSchema = z.object({
  scheduledDate: z.string().min(1, 'Selecciona una fecha'),
  title: z.string().min(2, 'Ingresa un título').max(200),
  channel: z.enum(['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'WHATSAPP', 'GOOGLE_BUSINESS', 'META_ADS']),
  status: z.enum(['PLANNED', 'PUBLISHED']).optional(),
});

export type ContentItemFormValues = z.infer<typeof contentItemSchema>;
