export type MarketingChannel = 'INSTAGRAM' | 'TIKTOK' | 'FACEBOOK' | 'WHATSAPP' | 'GOOGLE_BUSINESS' | 'META_ADS';
export type CampaignStatus = 'PLANNED' | 'ACTIVE' | 'FINISHED';
export type ContentItemStatus = 'PLANNED' | 'PUBLISHED';
export type InfluencerStatus = 'CONTACTED' | 'NEGOTIATING' | 'ACTIVE' | 'FINISHED';

export interface Campaign {
  id: string;
  businessId: string;
  name: string;
  channel: MarketingChannel;
  status: CampaignStatus;
  budget: number;
  spent: number;
  reach: number;
  clicks: number;
  conversions: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignPayload {
  name: string;
  channel: MarketingChannel;
  budget: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateCampaignPayload {
  name?: string;
  channel?: MarketingChannel;
  status?: CampaignStatus;
  budget?: number;
  spent?: number;
  reach?: number;
  clicks?: number;
  conversions?: number;
  startDate?: string;
  endDate?: string;
}

export interface CampaignFilters {
  page?: number;
  limit?: number;
  status?: CampaignStatus;
  channel?: MarketingChannel;
}

export interface Coupon {
  id: string;
  businessId: string;
  code: string;
  discountLabel: string;
  usageCount: number;
  maxUsage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponPayload {
  code: string;
  discountLabel: string;
  maxUsage: number;
}

export interface UpdateCouponPayload {
  code?: string;
  discountLabel?: string;
  usageCount?: number;
  maxUsage?: number;
}

export interface CouponFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface ContentItem {
  id: string;
  businessId: string;
  scheduledDate: string;
  title: string;
  channel: MarketingChannel;
  status: ContentItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentItemPayload {
  scheduledDate: string;
  title: string;
  channel: MarketingChannel;
}

export interface UpdateContentItemPayload {
  scheduledDate?: string;
  title?: string;
  channel?: MarketingChannel;
  status?: ContentItemStatus;
}

export interface ContentItemFilters {
  page?: number;
  limit?: number;
  status?: ContentItemStatus;
  channel?: MarketingChannel;
}

export interface Influencer {
  id: string;
  businessId: string;
  name: string;
  channel: MarketingChannel;
  followers: number;
  status: InfluencerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInfluencerPayload {
  name: string;
  channel: MarketingChannel;
  followers?: number;
}

export interface UpdateInfluencerPayload {
  name?: string;
  channel?: MarketingChannel;
  followers?: number;
  status?: InfluencerStatus;
}

export interface InfluencerFilters {
  page?: number;
  limit?: number;
  status?: InfluencerStatus;
}
