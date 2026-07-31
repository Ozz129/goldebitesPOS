import { SystemRoleName } from './roles.constants';

export interface PermissionDefinition {
  code: string;
  module: string;
  description: string;
}

/** Full permission catalog. Seeded once and referenced by code in @Permissions(). */
export const PERMISSIONS: PermissionDefinition[] = [
  {
    code: 'dashboard.read',
    module: 'dashboard',
    description: 'View the dashboard summary',
  },

  { code: 'orders.read', module: 'orders', description: 'View orders' },
  { code: 'orders.create', module: 'orders', description: 'Create orders' },
  { code: 'orders.update', module: 'orders', description: 'Update orders' },
  { code: 'orders.cancel', module: 'orders', description: 'Cancel orders' },

  {
    code: 'kitchen.read',
    module: 'kitchen',
    description: 'View the kitchen display',
  },
  {
    code: 'kitchen.update_status',
    module: 'kitchen',
    description: 'Update order preparation status',
  },

  {
    code: 'inventory.read',
    module: 'inventory',
    description: 'View inventory and stock',
  },
  {
    code: 'inventory.adjust',
    module: 'inventory',
    description: 'Adjust inventory stock',
  },
  {
    code: 'inventory.transfer',
    module: 'inventory',
    description: 'Transfer inventory between locations',
  },
  {
    code: 'inventory.manage',
    module: 'inventory',
    description:
      'Create, update and deactivate inventory items (insumos catalog)',
  },
  {
    code: 'inventory.count',
    module: 'inventory',
    description: 'Start, record and complete physical inventory counts',
  },

  { code: 'products.read', module: 'products', description: 'View products' },
  {
    code: 'products.create',
    module: 'products',
    description: 'Create products',
  },
  {
    code: 'products.update',
    module: 'products',
    description: 'Update products',
  },

  { code: 'cash.open', module: 'cash', description: 'Open a cash session' },
  { code: 'cash.close', module: 'cash', description: 'Close a cash session' },
  {
    code: 'cash.withdraw',
    module: 'cash',
    description: 'Withdraw cash from a session',
  },

  {
    code: 'purchases.read',
    module: 'purchases',
    description: 'View purchase orders',
  },
  {
    code: 'purchases.create',
    module: 'purchases',
    description: 'Create purchase orders',
  },
  {
    code: 'purchases.approve',
    module: 'purchases',
    description: 'Approve purchase orders',
  },
  {
    code: 'purchases.receive',
    module: 'purchases',
    description: 'Record goods receipts against a purchase order',
  },
  {
    code: 'purchases.cancel',
    module: 'purchases',
    description: 'Cancel a purchase order',
  },
  {
    code: 'suppliers.read',
    module: 'purchases',
    description: 'View suppliers',
  },
  {
    code: 'suppliers.manage',
    module: 'purchases',
    description: 'Create, update and deactivate suppliers',
  },

  { code: 'users.manage', module: 'users', description: 'Manage users' },
  {
    code: 'roles.manage',
    module: 'users',
    description: 'Manage roles and their permissions',
  },

  {
    code: 'businesses.manage',
    module: 'settings',
    description: 'Manage business configuration',
  },
  {
    code: 'branches.manage',
    module: 'settings',
    description: 'Manage branches',
  },
  {
    code: 'settings.manage',
    module: 'settings',
    description: 'Manage general settings',
  },

  {
    code: 'analytics.read',
    module: 'analytics',
    description: 'View analytics and reports',
  },

  {
    code: 'employees.read',
    module: 'employees',
    description: 'View employees',
  },
  {
    code: 'employees.manage',
    module: 'employees',
    description: 'Create, update and manage employees and their shifts',
  },

  {
    code: 'checklists.read',
    module: 'checklists',
    description: 'View checklist templates and runs',
  },
  {
    code: 'checklists.manage',
    module: 'checklists',
    description: 'Create and update checklist templates',
  },
  {
    code: 'checklists.execute',
    module: 'checklists',
    description: 'Start and complete checklist runs',
  },

  {
    code: 'maintenance.read',
    module: 'maintenance',
    description: 'View equipment and maintenance history',
  },
  {
    code: 'maintenance.manage',
    module: 'maintenance',
    description: 'Create/update equipment and record interventions',
  },

  {
    code: 'loyalty.read',
    module: 'loyalty',
    description: 'View loyalty points, tiers and rewards',
  },
  {
    code: 'loyalty.manage',
    module: 'loyalty',
    description: 'Manage loyalty configuration and rewards catalog',
  },
  {
    code: 'loyalty.redeem',
    module: 'loyalty',
    description: 'Adjust customer points and redeem rewards',
  },

  {
    code: 'marketing.read',
    module: 'marketing',
    description: 'View marketing campaigns, coupons and content calendar',
  },
  {
    code: 'marketing.manage',
    module: 'marketing',
    description: 'Create and update marketing campaigns, coupons and content',
  },

  {
    code: 'documents.read',
    module: 'documents',
    description: 'View compliance documents',
  },
  {
    code: 'documents.manage',
    module: 'documents',
    description: 'Create and update compliance documents',
  },

  {
    code: 'finances.read',
    module: 'finances',
    description: 'View expenses and financial reports',
  },
  {
    code: 'finances.manage',
    module: 'finances',
    description: 'Record and update expenses',
  },
];

/** Default permission grants per seeded system role. */
export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRoleName, string[]> = {
  SUPER_ADMIN: PERMISSIONS.map((p) => p.code),
  OWNER: PERMISSIONS.map((p) => p.code),
  MANAGER: [
    'dashboard.read',
    'orders.read',
    'orders.create',
    'orders.update',
    'orders.cancel',
    'kitchen.read',
    'kitchen.update_status',
    'inventory.read',
    'inventory.adjust',
    'inventory.transfer',
    'inventory.manage',
    'inventory.count',
    'products.read',
    'products.create',
    'products.update',
    'suppliers.read',
    'suppliers.manage',
    'cash.open',
    'cash.close',
    'cash.withdraw',
    'purchases.read',
    'purchases.create',
    'purchases.approve',
    'purchases.receive',
    'purchases.cancel',
    'users.manage',
    'branches.manage',
    'analytics.read',
    'employees.read',
    'employees.manage',
    'checklists.read',
    'checklists.manage',
    'checklists.execute',
    'maintenance.read',
    'maintenance.manage',
    'loyalty.read',
    'loyalty.manage',
    'loyalty.redeem',
    'marketing.read',
    'marketing.manage',
    'documents.read',
    'documents.manage',
    'finances.read',
    'finances.manage',
  ],
  CASHIER: [
    'dashboard.read',
    'orders.read',
    'orders.create',
    'orders.update',
    'kitchen.read',
    'products.read',
    'cash.open',
    'cash.close',
    'cash.withdraw',
    'checklists.read',
    'checklists.execute',
    'loyalty.read',
    'loyalty.redeem',
  ],
  KITCHEN: [
    'orders.read',
    'kitchen.read',
    'kitchen.update_status',
    'checklists.read',
    'checklists.execute',
  ],
  INVENTORY: [
    'inventory.read',
    'inventory.adjust',
    'inventory.transfer',
    'inventory.manage',
    'inventory.count',
    'products.read',
    'suppliers.read',
    'suppliers.manage',
    'purchases.read',
    'purchases.create',
    'purchases.receive',
    'maintenance.read',
    'maintenance.manage',
    'checklists.read',
    'checklists.execute',
  ],
  EMPLOYEE: [
    'dashboard.read',
    'orders.read',
    'products.read',
    'checklists.read',
    'checklists.execute',
  ],
};
