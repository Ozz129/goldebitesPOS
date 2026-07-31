import { z } from 'zod';

/** Mirrors GB-BE's CreateCouponDto/UpdateCouponDto. */
export const couponSchema = z.object({
  code: z.string().min(2, 'Ingresa un código').max(30),
  discountLabel: z.string().min(2, 'Ingresa el beneficio').max(150),
  maxUsage: z.coerce.number().int().min(1, 'Debe ser al menos 1'),
});

export type CouponFormValues = z.infer<typeof couponSchema>;
