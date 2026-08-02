import { DbClient } from '../../../database/types/database.types';
import { DocumentScanRow } from '../domain/document-scan.interface';
import {
  CreateDocumentScanData,
  DocumentScanQuery,
  UpdateDocumentScanData,
} from '../domain/document-scan.types';

export interface IDocumentScansRepository {
  create(
    data: CreateDocumentScanData,
    client?: DbClient,
  ): Promise<DocumentScanRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<DocumentScanRow | null>;
  findAll(
    query: DocumentScanQuery,
  ): Promise<{ rows: DocumentScanRow[]; total: number }>;
  update(
    id: string,
    businessId: string,
    data: UpdateDocumentScanData,
  ): Promise<DocumentScanRow | null>;
  softDelete(id: string, businessId: string): Promise<DocumentScanRow | null>;
}

export const DOCUMENT_SCANS_REPOSITORY = Symbol('DOCUMENT_SCANS_REPOSITORY');
