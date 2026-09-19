import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { FundType } from '../domain/fund.types';

export class GetFundBalanceQueryDto {
  @ApiProperty({ enum: FundType })
  @IsEnum(FundType)
  fundType: FundType;

  @ApiPropertyOptional({ description: 'Ignored for BANK_ACCOUNT, which is always business-level.' })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
