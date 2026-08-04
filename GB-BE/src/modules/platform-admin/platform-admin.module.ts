import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BranchesModule } from '../branches/branches.module';
import { BusinessFeaturesModule } from '../business-features/business-features.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { PlatformAdminController } from './controllers/platform-admin.controller';
import { PlatformAdminService } from './services/platform-admin.service';

@Module({
  imports: [
    BusinessesModule,
    BranchesModule,
    RolesModule,
    UsersModule,
    BusinessFeaturesModule,
    AuditModule,
  ],
  controllers: [PlatformAdminController],
  providers: [PlatformAdminService],
})
export class PlatformAdminModule {}
