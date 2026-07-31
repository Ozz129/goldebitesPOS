import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../common/exceptions';
import { PaginatedResult } from '../../../common/pagination/paginated-result.interface';
import { buildPaginationMeta } from '../../../common/pagination/pagination.util';
import { TransactionService } from '../../../database/transaction.service';
import { AuditService } from '../../audit/services/audit.service';
import {
  ChecklistRun,
  ChecklistRunWithItems,
} from '../domain/checklist.interface';
import {
  ChecklistRunQuery,
  ChecklistRunStatus,
  ItemResultInput,
  StartChecklistRunData,
} from '../domain/checklist.types';
import { ChecklistMapper } from '../mappers/checklist.mapper';
import { CHECKLIST_TEMPLATES_REPOSITORY } from '../repositories/checklist-templates.repository.interface';
import type { IChecklistTemplatesRepository } from '../repositories/checklist-templates.repository.interface';
import { CHECKLIST_RUNS_REPOSITORY } from '../repositories/checklist-runs.repository.interface';
import type { IChecklistRunsRepository } from '../repositories/checklist-runs.repository.interface';

@Injectable()
export class ChecklistRunsService {
  constructor(
    @Inject(CHECKLIST_RUNS_REPOSITORY)
    private readonly runsRepository: IChecklistRunsRepository,
    @Inject(CHECKLIST_TEMPLATES_REPOSITORY)
    private readonly templatesRepository: IChecklistTemplatesRepository,
    private readonly transactionService: TransactionService,
    private readonly auditService: AuditService,
  ) {}

  async start(
    data: StartChecklistRunData,
    actorUserId?: string,
  ): Promise<ChecklistRunWithItems> {
    const template = await this.templatesRepository.findById(
      data.templateId,
      data.businessId,
    );
    if (!template) {
      throw new EntityNotFoundException('ChecklistTemplate', data.templateId);
    }
    const templateItems = await this.templatesRepository.findItems(
      data.templateId,
    );

    const { run, itemRows } = await this.transactionService.execute(
      async (client) => {
        const createdRun = await this.runsRepository.create(
          data,
          actorUserId,
          client,
        );
        const createdItems = await this.runsRepository.addItems(
          createdRun.id,
          templateItems.map((item, index) => ({
            templateItemId: item.id,
            label: item.label,
            displayOrder: index,
          })),
          client,
        );
        return { run: createdRun, itemRows: createdItems };
      },
    );

    await this.auditService.record({
      businessId: data.businessId,
      branchId: data.branchId,
      userId: actorUserId,
      entityType: 'checklist_run',
      entityId: run.id,
      action: 'START',
      newValues: { templateId: data.templateId },
    });

    return {
      ...ChecklistMapper.runToDomain(run),
      items: itemRows.map((item) => ChecklistMapper.runItemToDomain(item)),
    };
  }

  async findAll(
    query: ChecklistRunQuery,
  ): Promise<PaginatedResult<ChecklistRun>> {
    const { rows, total } = await this.runsRepository.findAll(query);
    return {
      data: rows.map((row) => ChecklistMapper.runToDomain(row)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async findOne(
    businessId: string,
    id: string,
  ): Promise<ChecklistRunWithItems> {
    const row = await this.getOwnedOrFail(businessId, id);
    const itemRows = await this.runsRepository.findItems(id);
    return {
      ...ChecklistMapper.runToDomain(row),
      items: itemRows.map((item) => ChecklistMapper.runItemToDomain(item)),
    };
  }

  async updateItemResults(
    businessId: string,
    id: string,
    items: ItemResultInput[],
    actorUserId?: string,
  ): Promise<ChecklistRunWithItems> {
    const row = await this.getOwnedOrFail(businessId, id);
    const itemRows = await this.runsRepository.updateItemResults(id, items);

    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'checklist_run',
      entityId: id,
      action: 'UPDATE_ITEMS',
    });

    return {
      ...ChecklistMapper.runToDomain(row),
      items: itemRows.map((item) => ChecklistMapper.runItemToDomain(item)),
    };
  }

  async complete(
    businessId: string,
    id: string,
    observations: string | undefined,
    actorUserId?: string,
  ): Promise<ChecklistRunWithItems> {
    await this.getOwnedOrFail(businessId, id);
    const itemRows = await this.runsRepository.findItems(id);
    const allChecked =
      itemRows.length > 0 && itemRows.every((item) => item.checked);
    const status = allChecked
      ? ChecklistRunStatus.COMPLETED
      : ChecklistRunStatus.INCOMPLETE;

    const row = await this.runsRepository.complete(
      id,
      businessId,
      status,
      observations,
    );
    if (!row) {
      throw new EntityNotFoundException('ChecklistRun', id);
    }

    await this.auditService.record({
      businessId,
      userId: actorUserId,
      entityType: 'checklist_run',
      entityId: id,
      action: `COMPLETE_${status}`,
    });

    return {
      ...ChecklistMapper.runToDomain(row),
      items: itemRows.map((item) => ChecklistMapper.runItemToDomain(item)),
    };
  }

  private async getOwnedOrFail(businessId: string, id: string) {
    const row = await this.runsRepository.findById(id, businessId);
    if (!row) {
      throw new EntityNotFoundException('ChecklistRun', id);
    }
    return row;
  }
}
