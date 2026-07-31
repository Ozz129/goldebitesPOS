import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ShiftInputDto } from './shift-input.dto';

export class SetEmployeeShiftsDto {
  @ApiProperty({ type: [ShiftInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShiftInputDto)
  shifts: ShiftInputDto[];
}
