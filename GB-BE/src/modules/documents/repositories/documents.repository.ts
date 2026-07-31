import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
import { DbClient } from '../../../database/types/database.types';
import { ComplianceDocumentRow } from '../domain/document.interface';
import {
  ComplianceDocumentQuery,
  CreateComplianceDocumentData,
  UpdateComplianceDocumentData,
} from '../domain/document.types';
import { IDocumentsRepository } from './documents.repository.interface';

const SELECT_COLUMNS = `id, business_id, name, category, issue_date, expiration_date, responsible, file_name, notes, created_at, updated_at, deleted_at`;

interface CountRow {
  count: string;
}

@Injectable()
export class DocumentsRepository implements IDocumentsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateComplianceDocumentData,
    client?: DbClient,
  ): Promise<ComplianceDocumentRow> {
    const result = await this.db.query<ComplianceDocumentRow>(
      `INSERT INTO compliance_documents (business_id, name, category, issue_date, expiration_date, responsible, file_name, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.name,
        data.category,
        data.issueDate,
        data.expirationDate ?? null,
        data.responsible ?? null,
        data.fileName ?? null,
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
  ): Promise<ComplianceDocumentRow | null> {
    const result = await this.db.query<ComplianceDocumentRow>(
      `SELECT ${SELECT_COLUMNS} FROM compliance_documents
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: ComplianceDocumentQuery,
  ): Promise<{ rows: ComplianceDocumentRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [query.businessId];

    if (query.category) {
      params.push(query.category);
      conditions.push(`category = $${params.length}`);
    }

    if (query.search) {
      params.push(`%${query.search}%`);
      conditions.push(`name ILIKE $${params.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM compliance_documents WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<ComplianceDocumentRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM compliance_documents
       WHERE ${whereClause}
       ORDER BY expiration_date NULLS LAST, name
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async update(
    id: string,
    businessId: string,
    data: UpdateComplianceDocumentData,
  ): Promise<ComplianceDocumentRow | null> {
    const result = await this.db.query<ComplianceDocumentRow>(
      `UPDATE compliance_documents
       SET name = COALESCE($3, name),
           category = COALESCE($4, category),
           issue_date = COALESCE($5, issue_date),
           expiration_date = COALESCE($6, expiration_date),
           responsible = COALESCE($7, responsible),
           file_name = COALESCE($8, file_name),
           notes = COALESCE($9, notes)
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        businessId,
        data.name ?? null,
        data.category ?? null,
        data.issueDate ?? null,
        data.expirationDate ?? null,
        data.responsible ?? null,
        data.fileName ?? null,
        data.notes ?? null,
      ],
    );
    return result.rows[0] ?? null;
  }

  async softDelete(
    id: string,
    businessId: string,
  ): Promise<ComplianceDocumentRow | null> {
    const result = await this.db.query<ComplianceDocumentRow>(
      `UPDATE compliance_documents SET deleted_at = now()
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId],
    );
    return result.rows[0] ?? null;
  }
}
