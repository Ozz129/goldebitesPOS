import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class UpsertTableNameDto {
  @ApiProperty()
  @IsUUID()
  branchId: string;

  @ApiProperty({ maxLength: 20 })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  tableNumber: string;

  @ApiProperty({ minLength: 1, maxLength: 100, description: 'Displayed everywhere instead of "Mesa {tableNumber}".' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}
