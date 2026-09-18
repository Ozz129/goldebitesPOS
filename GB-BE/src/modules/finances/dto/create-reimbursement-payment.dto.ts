import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateReimbursementPaymentDto {
  @ApiProperty({ description: 'Branch whose open Caja operativa funds this payout.' })
  @IsUUID()
  branchId: string;

  @ApiProperty({ minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class VoidReimbursementObligationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;
}
