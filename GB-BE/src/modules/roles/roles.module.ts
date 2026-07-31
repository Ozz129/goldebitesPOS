import { Module } from '@nestjs/common';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesController } from './controllers/roles.controller';
import { RolesRepository } from './repositories/roles.repository';
import { ROLES_REPOSITORY } from './repositories/roles.repository.interface';
import { RolesService } from './services/roles.service';

@Module({
  imports: [PermissionsModule],
  controllers: [RolesController],
  providers: [
    RolesService,
    { provide: ROLES_REPOSITORY, useClass: RolesRepository },
  ],
  exports: [RolesService, ROLES_REPOSITORY],
})
export class RolesModule {}
