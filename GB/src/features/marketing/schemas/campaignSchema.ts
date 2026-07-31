import { z } from 'zod';

/** Mirrors GB-BE's CreateCampaignDto/UpdateCampaignDto. */
export const campaignSchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre').max(150),
  channel: z.enum(['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'WHATSAPP', 'GOOGLE_BUSINESS', 'META_ADS']),
  budget: z.coerce.number().min(0, 'El presupuesto no puede ser negativo'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'FINISHED']).optional(),
  spent: z.coerce.number().min(0).optional(),
  reach: z.coerce.number().int().min(0).optional(),
  clicks: z.coerce.number().int().min(0).optional(),
  conversions: z.coerce.number().int().min(0).optional(),
});

export type CampaignFormValues = z.infer<typeof campaignSchema>;
