import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWompiIntentDto {
  @ApiPropertyOptional({
    maxLength: 100,
    description: 'Optional label for who this charge belongs to, e.g. for a split bill.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  payerLabel?: string;
}
