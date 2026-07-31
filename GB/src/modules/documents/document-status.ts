import type { StatusTone } from '../../components/common/StatusChip';
import type { ComplianceDocument } from './types/document.types';

export type DocumentStatus = 'vigente' | 'por_vencer' | 'vencido';

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  vigente: 'Vigente',
  por_vencer: 'Por vencer',
  vencido: 'Vencido',
};

export const DOCUMENT_STATUS_TONE: Record<DocumentStatus, StatusTone> = {
  vigente: 'success',
  por_vencer: 'warning',
  vencido: 'error',
};

/** Status is derived from expirationDate — there is no stored status column. */
export function getDocumentStatus(doc: Pick<ComplianceDocument, 'expirationDate'>): DocumentStatus {
  if (!doc.expirationDate) return 'vigente';
  const daysToExpire = Math.ceil((new Date(doc.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysToExpire < 0) return 'vencido';
  if (daysToExpire <= 30) return 'por_vencer';
  return 'vigente';
}
