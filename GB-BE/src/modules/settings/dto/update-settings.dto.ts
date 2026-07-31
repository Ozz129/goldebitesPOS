import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({
    minimum: 0,
    maximum: 1,
    description: 'Fraction, e.g. 0.19 for 19%',
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  taxRate: number;
}
