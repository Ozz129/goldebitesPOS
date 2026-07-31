import { z } from 'zod';

/** Mirrors GB-BE's CreateEmployeeDto/UpdateEmployeeDto. */
export const employeeSchema = z.object({
  firstName: z.string().min(1, 'Ingresa un nombre').max(100),
  lastName: z.string().min(1, 'Ingresa un apellido').max(100),
  phone: z.string().max(30).optional(),
  email: z.string().email('Ingresa un correo válido').max(150).optional().or(z.literal('')),
  position: z.string().max(100).optional(),
  hireDate: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
