import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { DocumentScansController } from './controllers/document-scans.controller';
import { DocumentScansRepository } from './repositories/document-scans.repository';
import { DOCUMENT_SCANS_REPOSITORY } from './repositories/document-scans.repository.interface';
import { DocumentScansService } from './services/document-scans.service';

@Module({
  imports: [AuditModule],
  controllers: [DocumentScansController],
  providers: [
    DocumentScansService,
    { provide: DOCUMENT_SCANS_REPOSITORY, useClass: DocumentScansRepository },
  ],
})
export class DocumentScansModule {}
