import { DbClient } from '../../../database/types/database.types';
import { ComplianceDocumentRow } from '../domain/document.interface';
import {
  ComplianceDocumentQuery,
  CreateComplianceDocumentData,
  UpdateComplianceDocumentData,
} from '../domain/document.types';

export interface IDocumentsRepository {
  create(
    data: CreateComplianceDocumentData,
    client?: DbClient,
  ): Promise<ComplianceDocumentRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<ComplianceDocumentRow | null>;
  findAll(
    query: ComplianceDocumentQuery,
  ): Promise<{ rows: ComplianceDocumentRow[]; total: number }>;
  update(
    id: string,
    businessId: string,
    data: UpdateComplianceDocumentData,
  ): Promise<ComplianceDocumentRow | null>;
  softDelete(
    id: string,
    businessId: string,
  ): Promise<ComplianceDocumentRow | null>;
}

export const DOCUMENTS_REPOSITORY = Symbol('DOCUMENTS_REPOSITORY');
