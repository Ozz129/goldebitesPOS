import type { WasteRecordFilters } from '../types/waste-record.types';

export const wasteRecordKeys = {
  all: ['waste-records'] as const,
  lists: () => [...wasteRecordKeys.all, 'list'] as const,
  list: (filters: WasteRecordFilters) => [...wasteRecordKeys.lists(), filters] as const,
};
