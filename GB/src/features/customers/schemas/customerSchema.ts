import { z } from 'zod';

/** Mirrors GB-BE's CreateCustomerDto/UpdateCustomerDto. */
export const customerSchema = z.object({
  firstName: z.string().min(1, 'Ingresa un nombre').max(100),
  lastName: z.string().max(100).optional(),
  email: z.string().email('Ingresa un correo válido').max(150).optional().or(z.literal('')),
  phone: z.string().max(30).optional(),
  documentNumber: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
