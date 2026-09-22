import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class BranchRuleInputDto {
  @ApiProperty({ minLength: 1, maxLength: 150 })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
