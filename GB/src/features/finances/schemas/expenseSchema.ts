import { z } from 'zod';

/** Mirrors GB-BE's CreateExpenseDto/UpdateExpenseDto. */
export const expenseSchema = z.object({
  category: z.enum(['COGS', 'OPERATING', 'PAYROLL', 'MARKETING', 'OTHER']),
  description: z.string().min(2, 'Ingresa una descripción').max(255),
  amount: z.coerce.number().min(0, 'El monto no puede ser negativo'),
  expenseDate: z.string().min(1, 'Selecciona una fecha'),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
