export const KIOSK_PATHS = {
  waiter: '/tablet/mesero',
  kitchen: '/tablet/cocina',
} as const;

export const KIOSK_PERMISSIONS: Record<'waiter' | 'kitchen', string[]> = {
  waiter: ['orders.create'],
  kitchen: ['kitchen.update_status'],
};
