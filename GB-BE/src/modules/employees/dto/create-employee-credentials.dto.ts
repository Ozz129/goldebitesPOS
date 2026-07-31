import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateEmployeeCredentialsDto {
  @ApiProperty({ description: 'Login email for the new account' })
  @IsEmail()
  @MaxLength(150)
  email: string;

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
