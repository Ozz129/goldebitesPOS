import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { DocumentsController } from './controllers/documents.controller';
import { DocumentsRepository } from './repositories/documents.repository';
import { DOCUMENTS_REPOSITORY } from './repositories/documents.repository.interface';
import { DocumentsService } from './services/documents.service';

@Module({
  imports: [AuditModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    { provide: DOCUMENTS_REPOSITORY, useClass: DocumentsRepository },
  ],
})
export class DocumentsModule {}
