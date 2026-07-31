export const kitchenKeys = {
  all: ['kitchen'] as const,
  queue: (branchId?: string) => [...kitchenKeys.all, 'queue', branchId ?? 'all'] as const,
};
