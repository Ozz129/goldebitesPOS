import type { DocumentScanCategory } from './types/document-scan.types';

export const DOCUMENT_SCAN_CATEGORY_LABELS: Record<DocumentScanCategory, string> = {
  invoice: 'Factura',
  receipt: 'Recibo',
  other: 'Otro',
};
