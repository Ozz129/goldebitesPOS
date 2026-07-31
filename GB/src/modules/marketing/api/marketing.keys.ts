import type {
  CampaignFilters,
  ContentItemFilters,
  CouponFilters,
  InfluencerFilters,
} from '../types/marketing.types';

export const campaignKeys = {
  all: ['marketing-campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters: CampaignFilters) => [...campaignKeys.lists(), filters] as const,
};

export const couponKeys = {
  all: ['marketing-coupons'] as const,
  lists: () => [...couponKeys.all, 'list'] as const,
  list: (filters: CouponFilters) => [...couponKeys.lists(), filters] as const,
};

export const contentItemKeys = {
  all: ['marketing-content-items'] as const,
  lists: () => [...contentItemKeys.all, 'list'] as const,
  list: (filters: ContentItemFilters) => [...contentItemKeys.lists(), filters] as const,
};

export const influencerKeys = {
  all: ['marketing-influencers'] as const,
  lists: () => [...influencerKeys.all, 'list'] as const,
  list: (filters: InfluencerFilters) => [...influencerKeys.lists(), filters] as const,
};
