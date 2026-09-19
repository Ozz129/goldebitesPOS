import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class InitializeBankAccountDto {
  @ApiProperty({ minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Origin of the initial balance — mandatory, kept as permanent evidence.' })
  @IsString()
  @IsNotEmpty()
  notes: string;
}
