import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { AuditService } from '../../audit/services/audit.service';
import { DocumentScan, DocumentScanRow } from '../domain/document-scan.interface';
import {
  CreateDocumentScanData,
  DocumentScanQuery,
  UpdateDocumentScanData,
} from '../domain/document-scan.types';
import { DocumentScanMapper } from '../mappers/document-scan.mapper';
import { deleteDocumentScanFile } from '../storage/document-scan-storage.util';
import { DOCUMENT_SCANS_REPOSITORY } from '../repositories/document-scans.repository.interface';
import type { IDocumentScansRepository } from '../repositories/document-scans.repository.interface';

@Injectable()
export class DocumentScansService {
  constructor(
    @Inject(DOCUMENT_SCANS_REPOSITORY)
    private readonly documentScansRepository: IDocumentScansRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateDocumentScanData,
    actorUserId?: string,
  ): Promise<DocumentScan> {
    const row = await this.documentScansRepository.create(data);
    await this.auditService.record({
      businessId: data.businessId,
      userId: actorUserId,
      entityType: 'document_scan',
      entityId: row.id,
      action: 'CREATE',
      newValues: { title: row.title, category: row.category },
    });
    return DocumentScanMapper.toDomain(row);
  }

  async findAll(
    query: DocumentScanQuery,
  ): Promise<PaginatedResult<DocumentScan>> {
    const { rows, total } = await this.documentScansRepository.findAll(query);
    return {
      data: rows.map((row) => DocumentScanMapper.toDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  /** Returns the raw row (including storage_path) for streaming the file back — never exposed via the JSON API. */
  async getRowOrFail(
    businessId: string,
    id: string,
  ): Promise<DocumentScanRow> {
    const row = await this.documentScansRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('DocumentScan', id);
    }
    return row;
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateDocumentScanData,
    actorUserId?: string,
  ): Promise<DocumentScan> {
    const row = await this.documentScansRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('DocumentScan', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'document_scan',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return DocumentScanMapper.toDomain(row);
  }

  async softDelete(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<void> {
    const row = await this.documentScansRepository.softDelete(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('DocumentScan', id);
    }
    deleteDocumentScanFile(row.storage_path);
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'document_scan',
      entityId: id,
      action: 'DELETE',
    });
  }
}
