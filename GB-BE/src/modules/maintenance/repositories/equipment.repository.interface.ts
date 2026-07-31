import { DbClient } from '../../../database/types/database.types';
import {
  EquipmentRow,
  MaintenanceInterventionRow,
} from '../domain/maintenance.interface';
import {
  CreateEquipmentData,
  CreateInterventionData,
  EquipmentQuery,
  EquipmentStatus,
  UpdateEquipmentData,
} from '../domain/maintenance.types';

export interface IEquipmentRepository {
  create(data: CreateEquipmentData, client?: DbClient): Promise<EquipmentRow>;
  findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<EquipmentRow | null>;
  findAll(
    query: EquipmentQuery,
  ): Promise<{ rows: EquipmentRow[]; total: number }>;
  update(
    id: string,
    businessId: string,
    data: UpdateEquipmentData,
    client?: DbClient,
  ): Promise<EquipmentRow | null>;
  setStatus(
    id: string,
    businessId: string,
    status: EquipmentStatus,
  ): Promise<EquipmentRow | null>;
  softDelete(id: string, businessId: string): Promise<EquipmentRow | null>;
  findInterventions(
    equipmentId: string,
    client?: DbClient,
  ): Promise<MaintenanceInterventionRow[]>;
  addIntervention(
    equipmentId: string,
    businessId: string,
    data: CreateInterventionData,
    actorUserId: string | undefined,
    client?: DbClient,
  ): Promise<MaintenanceInterventionRow>;
  softDeleteIntervention(
    equipmentId: string,
    interventionId: string,
  ): Promise<MaintenanceInterventionRow | null>;
}

export const EQUIPMENT_REPOSITORY = Symbol('EQUIPMENT_REPOSITORY');
