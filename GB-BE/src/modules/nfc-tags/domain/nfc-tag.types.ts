export interface CreateNfcTagData {
  businessId: string;
  branchId: string;
  tableNumber: string;
  name: string;
  actorUserId?: string;
}

export interface UpdateNfcTagData {
  name?: string;
  branchId?: string;
  tableNumber?: string;
}

export interface NfcTagQuery {
  businessId: string;
  branchId: string;
}
