import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['firstName', 'lastName', 'phone'] as const),
) {
  @ApiPropertyOptional({ description: 'Role id within the current business' })
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiPropertyOptional({
    description: 'Default branch id within the current business',
  })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
