import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, MaxLength, MinLength } from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({ minLength: 2, maxLength: 30 })
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  code: string;

  @ApiProperty({ minLength: 2, maxLength: 150 })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  discountLabel: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  maxUsage: number;
}
