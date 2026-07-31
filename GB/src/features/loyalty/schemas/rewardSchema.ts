import { z } from 'zod';

/** Mirrors GB-BE's CreateRewardDto/UpdateRewardDto. */
export const rewardSchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre').max(150),
  description: z.string().max(500).optional(),
  pointsCost: z.coerce.number().int().min(1, 'Debe ser al menos 1 punto'),
});

export type RewardFormValues = z.infer<typeof rewardSchema>;
