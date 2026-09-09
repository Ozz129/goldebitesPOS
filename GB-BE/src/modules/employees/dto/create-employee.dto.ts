import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EmployeePayFrequency } from '../domain/employee.types';

export class CreateEmployeeDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({ maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({
    description: 'System role granted to this employee, if any',
  })
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({
    minimum: 0,
    description: 'Pay rate ("valor") per shift/week/month, per payFrequency',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  payRate?: number;

  @ApiPropertyOptional({ enum: EmployeePayFrequency })
  @IsOptional()
  @IsEnum(EmployeePayFrequency)
  payFrequency?: EmployeePayFrequency;
}
