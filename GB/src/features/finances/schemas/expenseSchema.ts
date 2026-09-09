import { z } from 'zod';

/** Mirrors GB-BE's CreateExpenseDto/UpdateExpenseDto. */
export const expenseSchema = z.object({
  category: z.enum(['COGS', 'OPERATING', 'PAYROLL', 'MARKETING', 'OTHER']),
  name: z.string().min(2, 'Ingresa un nombre').max(150),
  description: z.string().min(2, 'Ingresa el motivo').max(255),
  responsible: z.string().min(2, 'Ingresa el responsable').max(150),
  amount: z.coerce.number().min(0, 'La cantidad no puede ser negativa'),
  expenseDate: z.string().min(1, 'Selecciona una fecha'),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
