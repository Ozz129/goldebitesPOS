import { useQuery } from '@tanstack/react-query';
import { inventoryQueryApi } from '../api/inventory-query.api';
import { inventoryKeys } from '../api/inventory.keys';

export function useInventoryQueryTemplates() {
  return useQuery({
    queryKey: inventoryKeys.queryTemplates(),
    queryFn: () => inventoryQueryApi.getTemplates(),
  });
}
