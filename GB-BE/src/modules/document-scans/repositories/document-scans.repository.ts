import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { DocumentScanRow } from '../domain/document-scan.interface';
import {
  CreateDocumentScanData,
  DocumentScanQuery,
  UpdateDocumentScanData,
} from '../domain/document-scan.types';
import { IDocumentScansRepository } from './document-scans.repository.interface';

const SELECT_COLUMNS = `id, business_id, category, title, document_date, original_file_name, storage_path, mime_type, file_size_bytes, uploaded_by, notes, created_at, updated_at, deleted_at`;

interface CountRow {
  count: string;
}

@Injectable()
export class DocumentScansRepository implements IDocumentScansRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateDocumentScanData,
    client?: DbClient,
  ): Promise<DocumentScanRow> {
    const result = await this.db.query<DocumentScanRow>(
      `INSERT INTO document_scans (business_id, category, title, document_date, original_file_name, storage_path, mime_type, file_size_bytes, uploaded_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.category,
        data.title,
        data.documentDate ?? null,
        data.originalFileName,
        data.storagePath,
        data.mimeType,
        data.fileSizeBytes,
        data.uploadedBy ?? null,
        data.notes ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<DocumentScanRow | null> {
    const result = await this.db.query<DocumentScanRow>(
      `SELECT ${SELECT_COLUMNS} FROM document_scans
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: DocumentScanQuery,
  ): Promise<{ rows: DocumentScanRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [query.businessId];

    if (query.category) {
      params.push(query.category);
      conditions.push(`category = $${params.length}`);
    }

    if (query.search) {
      params.push(`%${query.search}%`);
      conditions.push(`title ILIKE $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM document_scans WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<DocumentScanRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM document_scans
       WHERE ${whereClause}
       ORDER BY document_date NULLS LAST, created_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async update(
    id: string,
    businessId: string,
    data: UpdateDocumentScanData,
  ): Promise<DocumentScanRow | null> {
    const result = await this.db.query<DocumentScanRow>(
      `UPDATE document_scans
       SET category = COALESCE($3, category),
           title = COALESCE($4, title),
           document_date = COALESCE($5, document_date),
           notes = COALESCE($6, notes)
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        businessId,
        data.category ?? null,
        data.title ?? null,
        data.documentDate ?? null,
        data.notes ?? null,
      ],
    );
    return result.rows[0] ?? null;
  }

  async softDelete(
    id: string,
    businessId: string,
  ): Promise<DocumentScanRow | null> {
    const result = await this.db.query<DocumentScanRow>(
      `UPDATE document_scans SET deleted_at = now()
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId],
    );
    return result.rows[0] ?? null;
  }
}
