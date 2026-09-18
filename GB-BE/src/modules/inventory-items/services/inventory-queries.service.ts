import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleException, EntityNotFoundException } from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { AuditService } from '../../audit/services/audit.service';
import {
  CreateInventoryQueryTemplateData,
  INVENTORY_QUERY_FIELD_TYPE,
  INVENTORY_QUERY_OPERATORS_BY_TYPE,
  InventoryQueryCondition,
  InventoryQueryOperator,
  InventoryQueryResultItem,
  InventoryQueryTemplate,
  RunInventoryQueryData,
} from '../domain/inventory-query.types';
import { InventoryQueryResultMapper, InventoryQueryTemplateMapper } from '../mappers/inventory-query.mapper';
import { INVENTORY_ITEMS_REPOSITORY } from '../repositories/inventory-items.repository.interface';
import type { IInventoryItemsRepository } from '../repositories/inventory-items.repository.interface';
import { INVENTORY_QUERY_TEMPLATES_REPOSITORY } from '../repositories/inventory-query-templates.repository.interface';
import type { IInventoryQueryTemplatesRepository } from '../repositories/inventory-query-templates.repository.interface';

@Injectable()
export class InventoryQueriesService {
  constructor(
    @Inject(INVENTORY_ITEMS_REPOSITORY)
    private readonly inventoryItemsRepository: IInventoryItemsRepository,
    @Inject(INVENTORY_QUERY_TEMPLATES_REPOSITORY)
    private readonly templatesRepository: IInventoryQueryTemplatesRepository,
    private readonly auditService: AuditService,
  ) {}

  async run(data: RunInventoryQueryData): Promise<PaginatedResult<InventoryQueryResultItem>> {
    this.validateConditions(data.conditions);
    const { rows, total } = await this.inventoryItemsRepository.queryAdvanced(data);
    return {
      data: rows.map((row) => InventoryQueryResultMapper.toDomain(row)),
      meta: buildPaginationMeta(data.page, data.limit, total),
    };
  }

  async listTemplates(businessId: string): Promise<InventoryQueryTemplate[]> {
    const rows = await this.templatesRepository.findAll(businessId);
    return rows.map((row) => InventoryQueryTemplateMapper.toDomain(row));
  }

  async createTemplate(
    data: CreateInventoryQueryTemplateData,
    actorUserId?: string,
  ): Promise<InventoryQueryTemplate> {
    this.validateConditions(data.conditions);
    const row = await this.templatesRepository.create(data, actorUserId);
    await this.auditService.record({
      businessId: data.businessId,
      userId: actorUserId,
      entityType: 'inventory_query_template',
      entityId: row.id,
      action: 'CREATE',
      newValues: { name: row.name },
    });
    return InventoryQueryTemplateMapper.toDomain(row);
  }

  async deleteTemplate(businessId: string, id: string, actorUserId?: string): Promise<void> {
    const deleted = await this.templatesRepository.delete(id, businessId);
    if (!deleted) {
      throw new EntityNotFoundException('InventoryQueryTemplate', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'inventory_query_template',
      entityId: id,
      action: 'DELETE',
    });
  }

  /** Re-validates the stored conditions every time — a template can't be trusted blindly, e.g. if the field/operator whitelist changes later. */
  async runTemplate(
    businessId: string,
    id: string,
    branchId: string | undefined,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<InventoryQueryResultItem>> {
    const template = await this.templatesRepository.findById(id, businessId);
    if (!template) {
      throw new EntityNotFoundException('InventoryQueryTemplate', id);
    }
    return this.run({ businessId, branchId, conditions: template.conditions, page, limit });
  }

  private validateConditions(conditions: InventoryQueryCondition[]): void {
    for (const condition of conditions) {
      const fieldType = INVENTORY_QUERY_FIELD_TYPE[condition.field];
      const allowedOperators = INVENTORY_QUERY_OPERATORS_BY_TYPE[fieldType];
      if (!allowedOperators.includes(condition.operator)) {
        throw new BusinessRuleException(
          `Operator "${condition.operator}" is not valid for field "${condition.field}"`,
          'INVALID_QUERY_OPERATOR',
        );
      }

      if (condition.operator === InventoryQueryOperator.BETWEEN) {
        if (condition.value === undefined || condition.value2 === undefined) {
          throw new BusinessRuleException(
            'The "between" operator requires both a lower and an upper value',
            'INVALID_QUERY_VALUE',
          );
        }
      } else if (condition.operator === InventoryQueryOperator.IN) {
        if (!condition.values || condition.values.length === 0) {
          throw new BusinessRuleException(
            'The "in" operator requires at least one selected value',
            'INVALID_QUERY_VALUE',
          );
        }
      } else if (
        condition.operator !== InventoryQueryOperator.IS_EMPTY &&
        condition.operator !== InventoryQueryOperator.IS_NOT_EMPTY
      ) {
        if (condition.value === undefined || condition.value === '') {
          throw new BusinessRuleException(
            `Field "${condition.field}" requires a value for operator "${condition.operator}"`,
            'INVALID_QUERY_VALUE',
          );
        }
      }
    }
  }
}
