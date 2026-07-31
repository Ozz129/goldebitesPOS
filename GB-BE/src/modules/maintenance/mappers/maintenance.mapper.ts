import {
  Equipment,
  EquipmentRow,
  MaintenanceIntervention,
  MaintenanceInterventionRow,
} from '../domain/maintenance.interface';

export class MaintenanceMapper {
  static equipmentToDomain(row: EquipmentRow): Equipment {
    return {
      id: row.id,
      businessId: row.business_id,
      branchId: row.branch_id,
      name: row.name,
      serialNumber: row.serial_number,
      purchaseDate: row.purchase_date,
      warrantyUntil: row.warranty_until,
      status: row.status,
      technicalSupplier: row.technical_supplier,
      nextMaintenanceAt: row.next_maintenance_at,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static interventionToDomain(
    row: MaintenanceInterventionRow,
  ): MaintenanceIntervention {
    return {
      id: row.id,
      equipmentId: row.equipment_id,
      date: row.intervention_date,
      description: row.description,
      cost: parseFloat(row.cost),
      createdAt: row.created_at,
    };
  }
}
