import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateLoyaltyConfigDto {
  @ApiPropertyOptional({
    minimum: 0,
    description: 'Points earned per $1.000 COP spent',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pointsPerThousand?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  birthdayBonusEnabled?: boolean;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  birthdayBonusPoints?: number;
}
