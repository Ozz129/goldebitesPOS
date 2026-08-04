export interface FeatureModuleDefinition {
  key: string;
  label: string;
}

/**
 * Catalog of toggleable business modules (see business_features table and
 * the platform-admin module) — including "roles" (roles.manage +
 * users.manage), which is itself a sellable module like any other, not a
 * given. Only dashboard/settings are core and always on for every business.
 */
export const FEATURE_MODULES: FeatureModuleDefinition[] = [
  { key: 'roles', label: 'Roles y permisos' },
  { key: 'orders', label: 'Pedidos' },
  { key: 'kitchen', label: 'Cocina' },
  { key: 'cash-register', label: 'Caja' },
  { key: 'products', label: 'Productos y recetas' },
  { key: 'inventory', label: 'Inventario' },
  { key: 'purchases', label: 'Compras' },
  { key: 'suppliers', label: 'Proveedores' },
  { key: 'customers', label: 'Clientes' },
  { key: 'loyalty', label: 'Fidelización' },
  { key: 'finances', label: 'Finanzas' },
  { key: 'employees', label: 'Personal' },
  { key: 'checklists', label: 'Checklists' },
  { key: 'waste', label: 'Mermas' },
  { key: 'maintenance', label: 'Mantenimiento' },
  { key: 'documents', label: 'Documentos' },
  { key: 'documentScans', label: 'Facturas y Recibos' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'analytics', label: 'Analítica' },
];

export const FEATURE_MODULE_KEYS = FEATURE_MODULES.map((f) => f.key);
