export interface NfcTag {
  id: string;
  businessId: string;
  branchId: string;
  tableNumber: string;
  name: string;
  token: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNfcTagPayload {
  branchId: string;
  tableNumber: string;
  name: string;
}

export interface UpdateNfcTagPayload {
  name?: string;
  branchId?: string;
  tableNumber?: string;
}

/** What scanning a gallo's link resolves to — the public menu's fixed context. */
export interface PublicNfcResolution {
  businessId: string;
  branchId: string;
  businessName: string;
  tableNumber: string;
  /** The table's custom display name, or null if it was never given one — fall back to "Mesa {tableNumber}". */
  tableName: string | null;
}
