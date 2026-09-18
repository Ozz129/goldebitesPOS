import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ExpenseCategory, ExpensePaymentSource } from '../domain/expense.types';

export class CreateExpenseDto {
  @ApiProperty({ enum: ExpenseCategory })
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @ApiProperty({ minLength: 2, maxLength: 150 })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @ApiProperty({ minLength: 2, maxLength: 255 })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  description: string;

  @ApiProperty({ minLength: 2, maxLength: 150 })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  responsible: string;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty()
  @IsDateString()
  expenseDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({
    enum: ExpensePaymentSource,
    default: ExpensePaymentSource.BUSINESS_FUNDS,
    description: 'BUSINESS_FUNDS (default) draws from Golden Bites funds; PERSONAL_MONEY creates a reimbursement obligation instead.',
  })
  @IsOptional()
  @IsEnum(ExpensePaymentSource)
  paymentSource: ExpensePaymentSource = ExpensePaymentSource.BUSINESS_FUNDS;

  @ApiPropertyOptional({ description: 'An existing employee who paid personally — required (or payerName) when paymentSource is PERSONAL_MONEY.' })
  @IsOptional()
  @IsUUID()
  payerEmployeeId?: string;

  @ApiPropertyOptional({ maxLength: 150, description: 'Free-text name of who paid personally, for a payer not registered as an employee (e.g. a partner).' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  payerName?: string;
}
