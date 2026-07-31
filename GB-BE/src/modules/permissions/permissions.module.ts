import { Module } from '@nestjs/common';
import { PermissionsController } from './controllers/permissions.controller';
import { PermissionsRepository } from './repositories/permissions.repository';
import { PERMISSIONS_REPOSITORY } from './repositories/permissions.repository.interface';
import { PermissionsService } from './services/permissions.service';

@Module({
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    { provide: PERMISSIONS_REPOSITORY, useClass: PermissionsRepository },
  ],
  exports: [PermissionsService, PERMISSIONS_REPOSITORY],
})
export class PermissionsModule {}
