import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class UpdateNfcTagDto {
  @ApiPropertyOptional({ minLength: 2, maxLength: 150 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ description: 'Reassigns the gallo to a different branch.' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ maxLength: 20, description: 'Reassigns the gallo to a different table.' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  tableNumber?: string;
}
