import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { AuditService } from '../../audit/services/audit.service';
import {
  Equipment,
  EquipmentRow,
  EquipmentWithInterventions,
} from '../domain/maintenance.interface';
import {
  CreateEquipmentData,
  CreateInterventionData,
  EquipmentQuery,
  EquipmentStatus,
  UpdateEquipmentData,
} from '../domain/maintenance.types';
import { MaintenanceMapper } from '../mappers/maintenance.mapper';
import { EQUIPMENT_REPOSITORY } from '../repositories/equipment.repository.interface';
import type { IEquipmentRepository } from '../repositories/equipment.repository.interface';

@Injectable()
export class EquipmentService {
  constructor(
    @Inject(EQUIPMENT_REPOSITORY)
    private readonly equipmentRepository: IEquipmentRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateEquipmentData,
    actorUserId?: string,
  ): Promise<Equipment> {
    const row = await this.equipmentRepository.create(data);
    await this.auditService.record({
      businessId: data.businessId,
      branchId: data.branchId,
      userId: actorUserId,
      entityType: 'equipment',
      entityId: row.id,
      action: 'CREATE',
      newValues: { name: row.name },
    });
    return MaintenanceMapper.equipmentToDomain(row);
  }

  async findAll(query: EquipmentQuery): Promise<PaginatedResult<Equipment>> {
    const { rows, total } = await this.equipmentRepository.findAll(query);
    return {
      data: rows.map((row) => MaintenanceMapper.equipmentToDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(
    businessId: string,
    id: string,
  ): Promise<EquipmentWithInterventions> {
    const row = await this.getOwnedOrFail(businessId, id);
    const interventionRows =
      await this.equipmentRepository.findInterventions(id);
    return {
      ...MaintenanceMapper.equipmentToDomain(row),
      interventions: interventionRows.map((intervention) =>
        MaintenanceMapper.interventionToDomain(intervention),
      ),
    };
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateEquipmentData,
    actorUserId?: string,
  ): Promise<Equipment> {
    await this.getOwnedOrFail(businessId, id);
    const row = await this.equipmentRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('Equipment', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'equipment',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return MaintenanceMapper.equipmentToDomain(row);
  }

  async setStatus(
    businessId: string,
    id: string,
    status: EquipmentStatus,
    actorUserId?: string,
  ): Promise<Equipment> {
    await this.getOwnedOrFail(businessId, id);
    const row = await this.equipmentRepository.setStatus(
      id,
      businessId,
      status,
    );
    if (!row) {
      throw new EntityNotFoundException('Equipment', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'equipment',
      entityId: id,
      action: `STATUS_${status}`,
    });
    return MaintenanceMapper.equipmentToDomain(row);
  }

  async softDelete(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<void> {
    await this.getOwnedOrFail(businessId, id);
    const row = await this.equipmentRepository.softDelete(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('Equipment', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'equipment',
      entityId: id,
      action: 'DELETE',
    });
  }

  async addIntervention(
    businessId: string,
    id: string,
    data: CreateInterventionData,
    actorUserId?: string,
  ): Promise<EquipmentWithInterventions> {
    const row = await this.getOwnedOrFail(businessId, id);
    await this.equipmentRepository.addIntervention(
      id,
      businessId,
      data,
      actorUserId,
    );

    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'equipment',
      entityId: id,
      action: 'ADD_INTERVENTION',
      newValues: { description: data.description, cost: data.cost },
    });

    const interventionRows =
      await this.equipmentRepository.findInterventions(id);
    return {
      ...MaintenanceMapper.equipmentToDomain(row),
      interventions: interventionRows.map((intervention) =>
        MaintenanceMapper.interventionToDomain(intervention),
      ),
    };
  }

  async removeIntervention(
    businessId: string,
    id: string,
    interventionId: string,
    actorUserId?: string,
  ): Promise<void> {
    await this.getOwnedOrFail(businessId, id);
    const row = await this.equipmentRepository.softDeleteIntervention(
      id,
      interventionId,
    );
    if (!row) {
      throw new EntityNotFoundException(
        'MaintenanceIntervention',
        interventionId,
      );
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'equipment',
      entityId: id,
      action: 'REMOVE_INTERVENTION',
    });
  }

  private async getOwnedOrFail(
    businessId: string,
    id: string,
  ): Promise<EquipmentRow> {
    const row = await this.equipmentRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('Equipment', id);
    }
    return row;
  }
}
