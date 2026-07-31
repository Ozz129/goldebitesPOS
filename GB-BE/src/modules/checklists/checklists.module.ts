import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { ChecklistRunsController } from './controllers/checklist-runs.controller';
import { ChecklistTemplatesController } from './controllers/checklist-templates.controller';
import { ChecklistRunsRepository } from './repositories/checklist-runs.repository';
import { CHECKLIST_RUNS_REPOSITORY } from './repositories/checklist-runs.repository.interface';
import { ChecklistTemplatesRepository } from './repositories/checklist-templates.repository';
import { CHECKLIST_TEMPLATES_REPOSITORY } from './repositories/checklist-templates.repository.interface';
import { ChecklistRunsService } from './services/checklist-runs.service';
import { ChecklistTemplatesService } from './services/checklist-templates.service';

@Module({
  imports: [AuditModule],
  controllers: [ChecklistTemplatesController, ChecklistRunsController],
  providers: [
    ChecklistTemplatesService,
    ChecklistRunsService,
    {
      provide: CHECKLIST_TEMPLATES_REPOSITORY,
      useClass: ChecklistTemplatesRepository,
    },
    { provide: CHECKLIST_RUNS_REPOSITORY, useClass: ChecklistRunsRepository },
  ],
  exports: [ChecklistTemplatesService, ChecklistRunsService],
})
export class ChecklistsModule {}
