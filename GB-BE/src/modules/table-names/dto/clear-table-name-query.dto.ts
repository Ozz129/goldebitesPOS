import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class ClearTableNameQueryDto {
  @ApiProperty()
  @IsUUID()
  branchId: string;

  @ApiProperty({ maxLength: 20 })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  tableNumber: string;
}
