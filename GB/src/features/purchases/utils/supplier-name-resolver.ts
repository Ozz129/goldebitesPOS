import type { Supplier } from '../../../modules/suppliers/types/supplier.types';

export function supplierNameResolver(suppliers: Supplier[]): (supplierId: string) => string {
  const byId = new Map(suppliers.map((s) => [s.id, s.name]));
  return (supplierId: string) => byId.get(supplierId) ?? 'Proveedor desconocido';
}
