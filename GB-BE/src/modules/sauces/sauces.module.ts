import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { SaucesController } from './controllers/sauces.controller';
import { SaucesRepository } from './repositories/sauces.repository';
import { SAUCES_REPOSITORY } from './repositories/sauces.repository.interface';
import { SaucesService } from './services/sauces.service';

@Module({
  imports: [AuditModule],
  controllers: [SaucesController],
  providers: [
    SaucesService,
    { provide: SAUCES_REPOSITORY, useClass: SaucesRepository },
  ],
  exports: [SaucesService, SAUCES_REPOSITORY],
})
export class SaucesModule {}
