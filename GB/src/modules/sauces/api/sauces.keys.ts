import type { SauceFilters } from '../types/sauce.types';

export const sauceKeys = {
  all: ['sauces'] as const,
  lists: () => [...sauceKeys.all, 'list'] as const,
  list: (filters: SauceFilters) => [...sauceKeys.lists(), filters] as const,
  details: () => [...sauceKeys.all, 'detail'] as const,
  detail: (id: string) => [...sauceKeys.details(), id] as const,
};
