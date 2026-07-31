import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleException,
  EntityNotFoundException,
} from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { TransactionService } from '../../../database/transaction.service';
import { AuditService } from '../../audit/services/audit.service';
import {
  ChecklistTemplate,
  ChecklistTemplateRow,
  ChecklistTemplateWithItems,
} from '../domain/checklist.interface';
import {
  ChecklistTemplateQuery,
  CreateChecklistTemplateData,
  TemplateItemInput,
  UpdateChecklistTemplateData,
} from '../domain/checklist.types';
import { ChecklistMapper } from '../mappers/checklist.mapper';
import { CHECKLIST_TEMPLATES_REPOSITORY } from '../repositories/checklist-templates.repository.interface';
import type { IChecklistTemplatesRepository } from '../repositories/checklist-templates.repository.interface';

@Injectable()
export class ChecklistTemplatesService {
  constructor(
    @Inject(CHECKLIST_TEMPLATES_REPOSITORY)
    private readonly templatesRepository: IChecklistTemplatesRepository,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateChecklistTemplateData,
    items: TemplateItemInput[],
    actorUserId?: string,
  ): Promise<ChecklistTemplateWithItems> {
    if (items.length === 0) {
      throw new BusinessRuleException(
        'A checklist template must include at least one item',
        'CHECKLIST_TEMPLATE_EMPTY',
      );
    }

    const { template, itemRows } = await this.transactionService.execute(
      async (client) => {
        const row = await this.templatesRepository.create(data, client);
        const createdItems = await this.templatesRepository.addItems(
          row.id,
          items,
          client,
        );
        return { template: row, itemRows: createdItems };
      },
    );

    await this.auditService.record({
      businessId: data.businessId,
      userId: actorUserId,
      entityType: 'checklist_template',
      entityId: template.id,
      action: 'CREATE',
      newValues: { name: template.name, itemCount: items.length },
    });

    return {
      ...ChecklistMapper.templateToDomain(template),
      items: itemRows.map((item) => ChecklistMapper.templateItemToDomain(item)),
    };
  }

  async findAll(
    query: ChecklistTemplateQuery,
  ): Promise<PaginatedResult<ChecklistTemplate>> {
    const { rows, total } = await this.templatesRepository.findAll(query);
    return {
      data: rows.map((row) => ChecklistMapper.templateToDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(
    businessId: string,
    id: string,
  ): Promise<ChecklistTemplateWithItems> {
    const row = await this.getOwnedOrFail(businessId, id);
    const itemRows = await this.templatesRepository.findItems(id);
    return {
      ...ChecklistMapper.templateToDomain(row),
      items: itemRows.map((item) => ChecklistMapper.templateItemToDomain(item)),
    };
  }

  async update(
    businessId: string,
    id: string,
    data: UpdateChecklistTemplateData,
    actorUserId?: string,
  ): Promise<ChecklistTemplate> {
    await this.getOwnedOrFail(businessId, id);
    const row = await this.templatesRepository.update(id, businessId, data);
    if (!row) {
      throw new EntityNotFoundException('ChecklistTemplate', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'checklist_template',
      entityId: id,
      action: 'UPDATE',
      newValues: data as Record<string, unknown>,
    });
    return ChecklistMapper.templateToDomain(row);
  }

  async replaceItems(
    businessId: string,
    id: string,
    items: TemplateItemInput[],
    actorUserId?: string,
  ): Promise<ChecklistTemplateWithItems> {
    if (items.length === 0) {
      throw new BusinessRuleException(
        'A checklist template must include at least one item',
        'CHECKLIST_TEMPLATE_EMPTY',
      );
    }
    const row = await this.getOwnedOrFail(businessId, id);
    const itemRows = await this.transactionService.execute((client) =>
      this.templatesRepository.replaceItems(id, items, client),
    );

    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'checklist_template',
      entityId: id,
      action: 'UPDATE_ITEMS',
      newValues: { itemCount: items.length },
    });

    return {
      ...ChecklistMapper.templateToDomain(row),
      items: itemRows.map((item) => ChecklistMapper.templateItemToDomain(item)),
    };
  }

  async setActive(
    businessId: string,
    id: string,
    isActive: boolean,
    actorUserId?: string,
  ): Promise<ChecklistTemplate> {
    await this.getOwnedOrFail(businessId, id);
    const row = await this.templatesRepository.setActive(
      id,
      businessId,
      isActive,
    );
    if (!row) {
      throw new EntityNotFoundException('ChecklistTemplate', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'checklist_template',
      entityId: id,
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    });
    return ChecklistMapper.templateToDomain(row);
  }

  async softDelete(
    businessId: string,
    id: string,
    actorUserId?: string,
  ): Promise<void> {
    await this.getOwnedOrFail(businessId, id);
    const row = await this.templatesRepository.softDelete(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('ChecklistTemplate', id);
    }
    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'checklist_template',
      entityId: id,
      action: 'DELETE',
    });
  }

  /** Used by ChecklistRunsService to snapshot items when a run starts. */
  async getOwnedOrFail(
    businessId: string,
    id: string,
  ): Promise<ChecklistTemplateRow> {
    const row = await this.templatesRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('ChecklistTemplate', id);
    }
    return row;
  }
}
