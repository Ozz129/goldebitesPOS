import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { CashMovementType } from '../domain/cash-session.interface';

/** Manual movements only — SALE/OPENING/CLOSING are system-generated, never submitted directly. */
const MANUAL_MOVEMENT_TYPES = [
  CashMovementType.INCOME,
  CashMovementType.EXPENSE,
  CashMovementType.WITHDRAWAL,
] as const;

export class CreateCashMovementDto {
  @ApiProperty({ enum: MANUAL_MOVEMENT_TYPES })
  @IsEnum(CashMovementType)
  @IsIn(MANUAL_MOVEMENT_TYPES)
  movementType: CashMovementType;

  @ApiProperty({ minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
