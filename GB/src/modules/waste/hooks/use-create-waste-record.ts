import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wasteRecordsApi } from '../api/waste-records.api';
import { wasteRecordKeys } from '../api/waste-records.keys';
import { inventoryKeys } from '../../inventory/api/inventory.keys';
import type { CreateWasteRecordPayload } from '../types/waste-record.types';

export function useCreateWasteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWasteRecordPayload) => wasteRecordsApi.createRecord(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wasteRecordKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}
