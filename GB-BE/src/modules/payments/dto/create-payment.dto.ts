import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../../cash-sessions/domain/cash-session.interface';

export class CreatePaymentDto {
  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  reference?: string;

  @ApiPropertyOptional({
    maxLength: 100,
    description: 'Optional label for who this portion of a split bill belongs to, e.g. "Persona 1" or a name.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  payerLabel?: string;
}
