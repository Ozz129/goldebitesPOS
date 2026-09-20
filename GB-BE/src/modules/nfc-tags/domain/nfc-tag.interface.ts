export interface NfcTag {
  id: string;
  businessId: string;
  branchId: string;
  tableNumber: string;
  name: string;
  token: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NfcTagRow {
  id: string;
  business_id: string;
  branch_id: string;
  table_number: string;
  name: string;
  token: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/** What a scanned token resolves to for the public menu — never exposes the gallo's own id/token back out. */
export interface PublicNfcResolution {
  businessId: string;
  branchId: string;
  businessName: string;
  tableNumber: string;
}
