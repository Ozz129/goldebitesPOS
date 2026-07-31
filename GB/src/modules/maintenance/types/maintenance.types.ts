export type EquipmentStatus = 'OPERATIONAL' | 'IN_MAINTENANCE' | 'OUT_OF_SERVICE';

export interface Equipment {
  id: string;
  businessId: string;
  branchId: string | null;
  name: string;
  serialNumber: string | null;
  purchaseDate: string | null;
  warrantyUntil: string | null;
  status: EquipmentStatus;
  technicalSupplier: string | null;
  nextMaintenanceAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceIntervention {
  id: string;
  equipmentId: string;
  date: string;
  description: string;
  cost: number;
  createdAt: string;
}

export interface EquipmentWithInterventions extends Equipment {
  interventions: MaintenanceIntervention[];
}

export interface CreateEquipmentPayload {
  name: string;
  branchId?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyUntil?: string;
  technicalSupplier?: string;
  nextMaintenanceAt?: string;
  notes?: string;
}

export type UpdateEquipmentPayload = Partial<CreateEquipmentPayload>;

export interface CreateInterventionPayload {
  date: string;
  description: string;
  cost: number;
}

export interface EquipmentFilters {
  page?: number;
  limit?: number;
  status?: EquipmentStatus;
  branchId?: string;
  search?: string;
}
