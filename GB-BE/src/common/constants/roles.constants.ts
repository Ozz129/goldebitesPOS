/** System role names seeded for every new business. */
export const SYSTEM_ROLES = [
  'SUPER_ADMIN',
  'OWNER',
  'MANAGER',
  'CASHIER',
  'KITCHEN',
  'INVENTORY',
  'EMPLOYEE',
] as const;

export type SystemRoleName = (typeof SYSTEM_ROLES)[number];
