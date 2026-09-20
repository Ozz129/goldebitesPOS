import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ExpensePaymentSource, SELECTABLE_EXPENSE_PAYMENT_SOURCES } from '../domain/expense.types';

export class ReclassifyExpenseSourceDto {
  @ApiProperty({
    enum: SELECTABLE_EXPENSE_PAYMENT_SOURCES,
    description: 'The corrected source (BR-08) — must differ from the expense\'s current source.',
  })
  @IsIn(SELECTABLE_EXPENSE_PAYMENT_SOURCES)
  paymentSource: ExpensePaymentSource;

  @ApiPropertyOptional({ description: 'An existing employee who paid personally — required (or payerName) when the new paymentSource is PERSONAL_MONEY.' })
  @IsOptional()
  @IsUUID()
  payerEmployeeId?: string;

  @ApiPropertyOptional({ maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  payerName?: string;

  @ApiPropertyOptional({ description: 'CASH_OPERATIONAL only — which branch to resolve the target session against. Defaults to the expense\'s own branch.' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ description: 'CASH_OPERATIONAL only — which open cash session received/absorbs the money. Required only when more than one is open.' })
  @IsOptional()
  @IsUUID()
  cashSessionId?: string;

  @ApiProperty({ minLength: 5, maxLength: 500, description: 'Mandatory observation explaining the correction (BR-08).' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason: string;
}
