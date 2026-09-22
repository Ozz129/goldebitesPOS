import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreateEmployeeCredentialsDto {
  @ApiProperty({
    description: 'Role to grant, controls what this account can access',
  })
  @IsUUID()
  roleId: string;

  @ApiPropertyOptional({
    description: 'Defaults to the employee branch, if any',
  })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
