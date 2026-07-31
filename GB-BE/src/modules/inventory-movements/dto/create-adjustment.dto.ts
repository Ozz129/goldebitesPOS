import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAdjustmentDto {
  @ApiProperty()
  @IsUUID()
  branchId: string;

  @ApiPropertyOptional({
    description: 'Specific storage location within the branch',
  })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @ApiProperty()
  @IsUUID()
  inventoryItemId: string;

  @ApiProperty({ enum: ['IN', 'OUT'] })
  @IsIn(['IN', 'OUT'])
  direction: 'IN' | 'OUT';

  @ApiProperty({ minimum: 0.001 })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({ minLength: 3, maxLength: 255 })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  reason: string;
}
