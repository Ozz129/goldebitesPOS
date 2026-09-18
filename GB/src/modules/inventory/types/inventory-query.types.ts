export type InventoryQueryField =
  | 'name'
  | 'sku'
  | 'categoryId'
  | 'unit'
  | 'brand'
  | 'model'
  | 'serialNumber'
  | 'minimumStock'
  | 'currentCost'
  | 'currentStock'
  | 'isActive'
  | 'createdAt';

export type InventoryQueryOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'startsWith'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'greaterThan'
  | 'greaterOrEqual'
  | 'lessThan'
  | 'lessOrEqual'
  | 'between'
  | 'in';

export type InventoryQueryIntent = 'detail' | 'count' | 'sumStock' | 'totalValue' | 'averageCost';

export const INVENTORY_QUERY_INTENT_LABELS: Record<InventoryQueryIntent, string> = {
  detail: 'Detalle (lista de resultados)',
  count: 'Conteo (cuántos coinciden)',
  sumStock: 'Suma de stock',
  totalValue: 'Valor total del inventario (stock × costo)',
  averageCost: 'Costo promedio',
};

export type InventoryQueryFieldType = 'text' | 'number' | 'boolean' | 'date' | 'category';

export const INVENTORY_QUERY_FIELD_TYPE: Record<InventoryQueryField, InventoryQueryFieldType> = {
  name: 'text',
  sku: 'text',
  categoryId: 'category',
  unit: 'text',
  brand: 'text',
  model: 'text',
  serialNumber: 'text',
  minimumStock: 'number',
  currentCost: 'number',
  currentStock: 'number',
  isActive: 'boolean',
  createdAt: 'date',
};

export const INVENTORY_QUERY_FIELD_LABELS: Record<InventoryQueryField, string> = {
  name: 'Nombre',
  sku: 'Referencia',
  categoryId: 'Categoría',
  unit: 'Unidad',
  brand: 'Marca',
  model: 'Modelo',
  serialNumber: 'Número de serie',
  minimumStock: 'Stock mínimo',
  currentCost: 'Costo actual',
  currentStock: 'Stock actual',
  isActive: 'Estado (activo)',
  createdAt: 'Fecha de creación',
};

export const INVENTORY_QUERY_OPERATOR_LABELS: Record<InventoryQueryOperator, string> = {
  equals: 'es',
  notEquals: 'no es',
  contains: 'contiene',
  startsWith: 'empieza con',
  isEmpty: 'está vacío',
  isNotEmpty: 'no está vacío',
  greaterThan: 'mayor que',
  greaterOrEqual: 'mayor o igual que',
  lessThan: 'menor que',
  lessOrEqual: 'menor o igual que',
  between: 'entre',
  in: 'es cualquiera de',
};

export const INVENTORY_QUERY_OPERATORS_BY_TYPE: Record<InventoryQueryFieldType, InventoryQueryOperator[]> = {
  text: ['contains', 'equals', 'startsWith', 'isEmpty', 'isNotEmpty'],
  number: ['equals', 'notEquals', 'greaterThan', 'greaterOrEqual', 'lessThan', 'lessOrEqual', 'between'],
  boolean: ['equals'],
  date: ['greaterThan', 'lessThan', 'between'],
  category: ['equals', 'in', 'isEmpty', 'isNotEmpty'],
};

export interface InventoryQueryCondition {
  field: InventoryQueryField;
  operator: InventoryQueryOperator;
  value?: string | number | boolean;
  value2?: string | number;
  values?: string[];
}

export interface InventoryQueryResultItem {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  name: string;
  sku: string | null;
  unit: string;
  minimumStock: number;
  currentCost: number;
  currentStock: number;
  serialNumber: string | null;
  brand: string | null;
  model: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface InventoryQueryAggregateResult {
  intent: Exclude<InventoryQueryIntent, 'detail'>;
  value: number;
}

export interface InventoryQueryTemplate {
  id: string;
  businessId: string;
  name: string;
  conditions: InventoryQueryCondition[];
  intent: InventoryQueryIntent;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RunInventoryQueryPayload {
  conditions: InventoryQueryCondition[];
  intent: InventoryQueryIntent;
  branchId?: string;
  page?: number;
  limit?: number;
}

export interface CreateInventoryQueryTemplatePayload {
  name: string;
  conditions: InventoryQueryCondition[];
  intent: InventoryQueryIntent;
}
