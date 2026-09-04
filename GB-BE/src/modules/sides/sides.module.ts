import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { SidesController } from './controllers/sides.controller';
import { SidesRepository } from './repositories/sides.repository';
import { SIDES_REPOSITORY } from './repositories/sides.repository.interface';
import { SidesService } from './services/sides.service';

@Module({
  imports: [AuditModule],
  controllers: [SidesController],
  providers: [
    SidesService,
    { provide: SIDES_REPOSITORY, useClass: SidesRepository },
  ],
  exports: [SidesService, SIDES_REPOSITORY],
})
export class SidesModule {}
