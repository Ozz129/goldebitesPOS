import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class InitializeReserveDto {
  @ApiPropertyOptional({ description: 'Required when the business has active branches.' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({ minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Origin of the counted cash — mandatory, kept as permanent evidence.' })
  @IsString()
  @IsNotEmpty()
  notes: string;
}
