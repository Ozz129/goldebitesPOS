import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class OpenCashSessionDto {
  @ApiProperty()
  @IsUUID()
  branchId: string;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  openingAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
