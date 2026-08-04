import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RequiresFeature } from '../../../common/decorators/requires-feature.decorator';
import { PermissionsService } from '../services/permissions.service';

@ApiTags('Permissions')
@ApiBearerAuth()
@RequiresFeature('roles')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Permissions('roles.manage')
  @ApiOperation({ summary: 'List the full permission catalog' })
  findAll() {
    return this.permissionsService.findAll();
  }
}
