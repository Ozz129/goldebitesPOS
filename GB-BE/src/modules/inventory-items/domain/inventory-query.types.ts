export enum InventoryQueryField {
  NAME = 'name',
  SKU = 'sku',
  CATEGORY_ID = 'categoryId',
  UNIT = 'unit',
  BRAND = 'brand',
  MODEL = 'model',
  SERIAL_NUMBER = 'serialNumber',
  MINIMUM_STOCK = 'minimumStock',
  CURRENT_COST = 'currentCost',
  CURRENT_STOCK = 'currentStock',
  IS_ACTIVE = 'isActive',
  CREATED_AT = 'createdAt',
}

export enum InventoryQueryOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  IS_EMPTY = 'isEmpty',
  IS_NOT_EMPTY = 'isNotEmpty',
  GREATER_THAN = 'greaterThan',
  GREATER_OR_EQUAL = 'greaterOrEqual',
  LESS_THAN = 'lessThan',
  LESS_OR_EQUAL = 'lessOrEqual',
  BETWEEN = 'between',
  IN = 'in',
}

export type InventoryQueryFieldType = 'text' | 'number' | 'boolean' | 'date' | 'category';

/** Every field's type — drives which operators are valid for it (see OPERATORS_BY_TYPE). */
export const INVENTORY_QUERY_FIELD_TYPE: Record<InventoryQueryField, InventoryQueryFieldType> = {
  [InventoryQueryField.NAME]: 'text',
  [InventoryQueryField.SKU]: 'text',
  [InventoryQueryField.CATEGORY_ID]: 'category',
  [InventoryQueryField.UNIT]: 'text',
  [InventoryQueryField.BRAND]: 'text',
  [InventoryQueryField.MODEL]: 'text',
  [InventoryQueryField.SERIAL_NUMBER]: 'text',
  [InventoryQueryField.MINIMUM_STOCK]: 'number',
  [InventoryQueryField.CURRENT_COST]: 'number',
  [InventoryQueryField.CURRENT_STOCK]: 'number',
  [InventoryQueryField.IS_ACTIVE]: 'boolean',
  [InventoryQueryField.CREATED_AT]: 'date',
};

/** The only operators ever accepted for each field type — validated server-side before any SQL is built. */
export const INVENTORY_QUERY_OPERATORS_BY_TYPE: Record<InventoryQueryFieldType, InventoryQueryOperator[]> = {
  text: [
    InventoryQueryOperator.CONTAINS,
    InventoryQueryOperator.EQUALS,
    InventoryQueryOperator.STARTS_WITH,
    InventoryQueryOperator.IS_EMPTY,
    InventoryQueryOperator.IS_NOT_EMPTY,
  ],
  number: [
    InventoryQueryOperator.EQUALS,
    InventoryQueryOperator.NOT_EQUALS,
    InventoryQueryOperator.GREATER_THAN,
    InventoryQueryOperator.GREATER_OR_EQUAL,
    InventoryQueryOperator.LESS_THAN,
    InventoryQueryOperator.LESS_OR_EQUAL,
    InventoryQueryOperator.BETWEEN,
  ],
  boolean: [InventoryQueryOperator.EQUALS],
  date: [InventoryQueryOperator.GREATER_THAN, InventoryQueryOperator.LESS_THAN, InventoryQueryOperator.BETWEEN],
  category: [
    InventoryQueryOperator.EQUALS,
    InventoryQueryOperator.IN,
    InventoryQueryOperator.IS_EMPTY,
    InventoryQueryOperator.IS_NOT_EMPTY,
  ],
};

export interface InventoryQueryCondition {
  field: InventoryQueryField;
  operator: InventoryQueryOperator;
  value?: string | number | boolean;
  /** Second bound, only for BETWEEN. */
  value2?: string | number;
  /** Only for IN (category multi-select). */
  values?: string[];
}

export interface RunInventoryQueryData {
  businessId: string;
  branchId?: string;
  conditions: InventoryQueryCondition[];
  page: number;
  limit: number;
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
  createdAt: Date;
}

export interface InventoryQueryResultRow {
  id: string;
  category_id: string | null;
  category_name: string | null;
  name: string;
  sku: string | null;
  unit: string;
  minimum_stock: string;
  current_cost: string;
  current_stock: string;
  serial_number: string | null;
  brand: string | null;
  model: string | null;
  is_active: boolean;
  created_at: Date;
}

export interface InventoryQueryTemplate {
  id: string;
  businessId: string;
  name: string;
  conditions: InventoryQueryCondition[];
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryQueryTemplateRow {
  id: string;
  business_id: string;
  name: string;
  conditions: InventoryQueryCondition[];
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInventoryQueryTemplateData {
  businessId: string;
  name: string;
  conditions: InventoryQueryCondition[];
}
