import type { SideFilters } from '../types/side.types';

export const sideKeys = {
  all: ['sides'] as const,
  lists: () => [...sideKeys.all, 'list'] as const,
  list: (filters: SideFilters) => [...sideKeys.lists(), filters] as const,
  details: () => [...sideKeys.all, 'detail'] as const,
  detail: (id: string) => [...sideKeys.details(), id] as const,
};
