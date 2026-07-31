export enum EquipmentStatus {
  OPERATIONAL = 'OPERATIONAL',
  IN_MAINTENANCE = 'IN_MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

export interface CreateEquipmentData {
  businessId: string;
  branchId?: string;
  name: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyUntil?: string;
  technicalSupplier?: string;
  nextMaintenanceAt?: string;
  notes?: string;
}

export interface UpdateEquipmentData {
  branchId?: string;
  name?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyUntil?: string;
  technicalSupplier?: string;
  nextMaintenanceAt?: string;
  notes?: string;
}

export interface EquipmentQuery {
  businessId: string;
  page: number;
  limit: number;
  status?: EquipmentStatus;
  branchId?: string;
  search?: string;
}

export interface CreateInterventionData {
  date: string;
  description: string;
  cost: number;
}
