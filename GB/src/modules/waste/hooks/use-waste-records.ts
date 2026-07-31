import { useQuery } from '@tanstack/react-query';
import { wasteRecordsApi } from '../api/waste-records.api';
import { wasteRecordKeys } from '../api/waste-records.keys';
import type { WasteRecordFilters } from '../types/waste-record.types';

export function useWasteRecords(filters: WasteRecordFilters = {}) {
  return useQuery({
    queryKey: wasteRecordKeys.list(filters),
    queryFn: () => wasteRecordsApi.getRecords(filters),
    staleTime: 30_000,
  });
}
