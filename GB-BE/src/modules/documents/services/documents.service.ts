import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { AuditService } from '../../audit/services/audit.service';
import { ComplianceDocument } from '../domain/document.interface';
import {
  ComplianceDocumentQuery,
  CreateComplianceDocumentData,
  UpdateComplianceDocumentData,
} from '../domain/document.types';
import { DocumentMapper } from '../mappers/document.mapper';
import { DOCUMENTS_REPOSITORY } from '../repositories/documents.repository.interface';
import type { IDocumentsRepository } from '../repositories/documents.repository.interface';

@Injectable()
export class DocumentsService {
  constructor(
    @Inject(DOCUMENTS_REPOSITORY)
    private readonly documentsRepository: IDocumentsRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateComplianceDocumentData,
    actorUserId?: string,
  ): Promise<ComplianceDocument> {
    const row = await this.documentsRepository.create(data);
    await this.auditService.record({
      businessId: data.businessId,
      userId: actorUserId,
      entityType: 'compliance_document',
      entityId: row.id,
      action: 'CREATE',
      newValues: { name: row.name, category: row.category },
    });
    return DocumentMapper.toDomain(row);
  }

  async findAll(
    query: ComplianceDocumentQuery,
  ): Promise<PaginatedResult<ComplianceDocument>> {
    const { rows, total } = await this.documentsRepository.findAll(query);
    return {
      data: rows.map((row) => DocumentMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateComplianceDocumentData,
    actorUserId?: string,
  ): Promise<ComplianceDocument> {
    const row = await this.documentsRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('ComplianceDocument', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'compliance_document',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return DocumentMapper.toDomain(row);
  }

  async softDelete(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<void> {
    const row = await this.documentsRepository.softDelete(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('ComplianceDocument', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'compliance_document',
      entityId: id,
      action: 'DELETE',
    });
  }
}
