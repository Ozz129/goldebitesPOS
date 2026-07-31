import { z } from 'zod';

/** Mirrors GB-BE's CreateInfluencerDto/UpdateInfluencerDto. */
export const influencerSchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre').max(150),
  channel: z.enum(['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'WHATSAPP', 'GOOGLE_BUSINESS', 'META_ADS']),
  followers: z.coerce.number().int().min(0).optional(),
  status: z.enum(['CONTACTED', 'NEGOTIATING', 'ACTIVE', 'FINISHED']).optional(),
});

export type InfluencerFormValues = z.infer<typeof influencerSchema>;
