import { EquipmentStatus } from './maintenance.types';

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
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipmentRow {
  id: string;
  business_id: string;
  branch_id: string | null;
  name: string;
  serial_number: string | null;
  purchase_date: string | null;
  warranty_until: string | null;
  status: EquipmentStatus;
  technical_supplier: string | null;
  next_maintenance_at: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface MaintenanceIntervention {
  id: string;
  equipmentId: string;
  date: string;
  description: string;
  cost: number;
  createdAt: Date;
}

export interface MaintenanceInterventionRow {
  id: string;
  equipment_id: string;
  intervention_date: string;
  description: string;
  cost: string;
  created_at: Date;
}

export interface EquipmentWithInterventions extends Equipment {
  interventions: MaintenanceIntervention[];
}
