import type { MovementFilters, RewardFilters } from '../types/loyalty.types';

export const loyaltyKeys = {
  config: ['loyalty', 'config'] as const,
  rewards: {
    all: ['loyalty-rewards'] as const,
    lists: () => [...loyaltyKeys.rewards.all, 'list'] as const,
    list: (filters: RewardFilters) => [...loyaltyKeys.rewards.lists(), filters] as const,
  },
  movements: {
    all: ['loyalty-movements'] as const,
    lists: () => [...loyaltyKeys.movements.all, 'list'] as const,
    list: (filters: MovementFilters) => [...loyaltyKeys.movements.lists(), filters] as const,
  },
};
