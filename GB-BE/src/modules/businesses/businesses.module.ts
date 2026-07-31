import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { RolesModule } from '../roles/roles.module';
import { BusinessesController } from './controllers/businesses.controller';
import { BusinessesRepository } from './repositories/businesses.repository';
import { BUSINESSES_REPOSITORY } from './repositories/businesses.repository.interface';
import { BusinessesService } from './services/businesses.service';

@Module({
  imports: [RolesModule, AuditModule],
  controllers: [BusinessesController],
  providers: [
    BusinessesService,
    { provide: BUSINESSES_REPOSITORY, useClass: BusinessesRepository },
  ],
  exports: [BusinessesService, BUSINESSES_REPOSITORY],
})
export class BusinessesModule {}
