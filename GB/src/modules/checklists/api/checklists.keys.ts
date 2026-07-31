import type { ChecklistRunFilters, ChecklistTemplateFilters } from '../types/checklist.types';

export const checklistTemplateKeys = {
  all: ['checklist-templates'] as const,
  lists: () => [...checklistTemplateKeys.all, 'list'] as const,
  list: (filters: ChecklistTemplateFilters) => [...checklistTemplateKeys.lists(), filters] as const,
  details: () => [...checklistTemplateKeys.all, 'detail'] as const,
  detail: (id: string) => [...checklistTemplateKeys.details(), id] as const,
};

export const checklistRunKeys = {
  all: ['checklist-runs'] as const,
  lists: () => [...checklistRunKeys.all, 'list'] as const,
  list: (filters: ChecklistRunFilters) => [...checklistRunKeys.lists(), filters] as const,
  details: () => [...checklistRunKeys.all, 'detail'] as const,
  detail: (id: string) => [...checklistRunKeys.details(), id] as const,
};
