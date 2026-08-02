import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Text fields sent alongside the file in the multipart/form-data body. */
export class CreateDocumentScanDto {
  @ApiProperty({ minLength: 2, maxLength: 150 })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  title: string;

  @ApiProperty({
    maxLength: 30,
    example: 'invoice',
    description: 'Free-text category, e.g. invoice, receipt, other.',
  })
  @IsString()
  @MaxLength(30)
  category: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  documentDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
