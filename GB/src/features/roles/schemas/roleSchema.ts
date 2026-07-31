import { z } from 'zod';

/** Mirrors GB-BE's CreateRoleDto/UpdateRoleDto. */
export const roleSchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre').max(80),
  description: z.string().max(1000).optional(),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
