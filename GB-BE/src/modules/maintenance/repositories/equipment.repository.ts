import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { getOffset } from '../../../common/pagination/pagination.util';
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
import { IEquipmentRepository } from './equipment.repository.interface';

const SELECT_COLUMNS = `id, business_id, branch_id, name, serial_number, purchase_date, warranty_until, status, technical_supplier, next_maintenance_at, notes, created_at, updated_at, deleted_at`;
const INTERVENTION_COLUMNS = `id, equipment_id, intervention_date, description, cost, created_at`;

interface CountRow {
  count: string;
}

@Injectable()
export class EquipmentRepository implements IEquipmentRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateEquipmentData,
    client?: DbClient,
  ): Promise<EquipmentRow> {
    const result = await this.db.query<EquipmentRow>(
      `INSERT INTO equipment (business_id, branch_id, name, serial_number, purchase_date, warranty_until, technical_supplier, next_maintenance_at, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.businessId,
        data.branchId ?? null,
        data.name,
        data.serialNumber ?? null,
        data.purchaseDate ?? null,
        data.warrantyUntil ?? null,
        data.technicalSupplier ?? null,
        data.nextMaintenanceAt ?? null,
        data.notes ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findById(
    id: string,
    businessId: string,
    client?: DbClient,
  ): Promise<EquipmentRow | null> {
    const result = await this.db.query<EquipmentRow>(
      `SELECT ${SELECT_COLUMNS} FROM equipment WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL`,
      [id, businessId],
      client,
    );
    return result.rows[0] ?? null;
  }

  async findAll(
    query: EquipmentQuery,
  ): Promise<{ rows: EquipmentRow[]; total: number }> {
    const conditions: string[] = ['business_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [query.businessId];

    if (query.status) {
      params.push(query.status);
      conditions.push(`status = $${params.length}`);
    }

    if (query.branchId) {
      params.push(query.branchId);
      conditions.push(`branch_id = $${params.length}`);
    }

    if (query.search) {
      params.push(`%${query.search}%`);
      const idx = params.length;
      conditions.push(`(name ILIKE $${idx} OR serial_number ILIKE $${idx})`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM equipment WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams = [
      ...params,
      query.limit,
      getOffset(query.page, query.limit),
    ];
    const rowsResult = await this.db.query<EquipmentRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM equipment
       WHERE ${whereClause}
       ORDER BY name
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return { rows: rowsResult.rows, total };
  }

  async update(
    id: string,
    businessId: string,
    data: UpdateEquipmentData,
    client?: DbClient,
  ): Promise<EquipmentRow | null> {
    const result = await this.db.query<EquipmentRow>(
      `UPDATE equipment
       SET branch_id = COALESCE($3, branch_id),
           name = COALESCE($4, name),
           serial_number = COALESCE($5, serial_number),
           purchase_date = COALESCE($6, purchase_date),
           warranty_until = COALESCE($7, warranty_until),
           technical_supplier = COALESCE($8, technical_supplier),
           next_maintenance_at = COALESCE($9, next_maintenance_at),
           notes = COALESCE($10, notes)
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        businessId,
        data.branchId ?? null,
        data.name ?? null,
        data.serialNumber ?? null,
        data.purchaseDate ?? null,
        data.warrantyUntil ?? null,
        data.technicalSupplier ?? null,
        data.nextMaintenanceAt ?? null,
        data.notes ?? null,
      ],
      client,
    );
    return result.rows[0] ?? null;
  }

  async setStatus(
    id: string,
    businessId: string,
    status: EquipmentStatus,
  ): Promise<EquipmentRow | null> {
    const result = await this.db.query<EquipmentRow>(
      `UPDATE equipment SET status = $3
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId, status],
    );
    return result.rows[0] ?? null;
  }

  async softDelete(
    id: string,
    businessId: string,
  ): Promise<EquipmentRow | null> {
    const result = await this.db.query<EquipmentRow>(
      `UPDATE equipment SET deleted_at = now()
       WHERE id = $1 AND business_id = $2 AND deleted_at IS NULL
       RETURNING ${SELECT_COLUMNS}`,
      [id, businessId],
    );
    return result.rows[0] ?? null;
  }

  async findInterventions(
    equipmentId: string,
    client?: DbClient,
  ): Promise<MaintenanceInterventionRow[]> {
    const result = await this.db.query<MaintenanceInterventionRow>(
      `SELECT ${INTERVENTION_COLUMNS} FROM maintenance_interventions
       WHERE equipment_id = $1 AND deleted_at IS NULL
       ORDER BY intervention_date DESC, created_at DESC`,
      [equipmentId],
      client,
    );
    return result.rows;
  }

  async addIntervention(
    equipmentId: string,
    businessId: string,
    data: CreateInterventionData,
    actorUserId: string | undefined,
    client?: DbClient,
  ): Promise<MaintenanceInterventionRow> {
    const result = await this.db.query<MaintenanceInterventionRow>(
      `INSERT INTO maintenance_interventions (equipment_id, business_id, intervention_date, description, cost, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${INTERVENTION_COLUMNS}`,
      [
        equipmentId,
        businessId,
        data.date,
        data.description,
        data.cost,
        actorUserId ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async softDeleteIntervention(
    equipmentId: string,
    interventionId: string,
  ): Promise<MaintenanceInterventionRow | null> {
    const result = await this.db.query<MaintenanceInterventionRow>(
      `UPDATE maintenance_interventions SET deleted_at = now()
       WHERE id = $1 AND equipment_id = $2 AND deleted_at IS NULL
       RETURNING ${INTERVENTION_COLUMNS}`,
      [interventionId, equipmentId],
    );
    return result.rows[0] ?? null;
  }
}
