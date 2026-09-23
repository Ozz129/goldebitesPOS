import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { EmployeePayFrequency, SELF_SERVICE_PAY_FREQUENCIES } from '../domain/employee.types';

export class UpdateMyPayFrequencyDto {
  @ApiProperty({ enum: SELF_SERVICE_PAY_FREQUENCIES })
  @IsIn(SELF_SERVICE_PAY_FREQUENCIES)
  payFrequency: EmployeePayFrequency;
}
