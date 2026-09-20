import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateNfcTagDto {
  @ApiProperty()
  @IsUUID()
  branchId: string;

  @ApiProperty({ maxLength: 20, description: 'The table this gallo is bound to — must match how the branch labels its tables.' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  tableNumber: string;

  @ApiProperty({ minLength: 2, maxLength: 150 })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;
}
