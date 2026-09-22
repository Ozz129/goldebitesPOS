import { useMemo } from 'react';
import { useTableNames } from './use-table-names';

/** {tableNumber: name} — for display-only consumers (Pedidos, cocina, comandas...) that only need a lookup, not the full row/id. */
export function useTableNameMap(branchId: string | null | undefined): Record<string, string> {
  const { data } = useTableNames(branchId);

  return useMemo(() => {
    const map: Record<string, string> = {};
    for (const tableName of data ?? []) {
      map[tableName.tableNumber] = tableName.name;
    }
    return map;
  }, [data]);
}
