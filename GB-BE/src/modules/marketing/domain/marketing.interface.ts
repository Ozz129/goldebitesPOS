import {
  CampaignStatus,
  ContentItemStatus,
  InfluencerStatus,
  MarketingChannel,
} from './marketing.types';

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
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignRow {
  id: string;
  business_id: string;
  name: string;
  channel: MarketingChannel;
  status: CampaignStatus;
  budget: string;
  spent: string;
  reach: number;
  clicks: number;
  conversions: number;
  start_date: string | null;
  end_date: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface Coupon {
  id: string;
  businessId: string;
  code: string;
  discountLabel: string;
  usageCount: number;
  maxUsage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponRow {
  id: string;
  business_id: string;
  code: string;
  discount_label: string;
  usage_count: number;
  max_usage: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ContentItem {
  id: string;
  businessId: string;
  scheduledDate: string;
  title: string;
  channel: MarketingChannel;
  status: ContentItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentItemRow {
  id: string;
  business_id: string;
  scheduled_date: string;
  title: string;
  channel: MarketingChannel;
  status: ContentItemStatus;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface Influencer {
  id: string;
  businessId: string;
  name: string;
  channel: MarketingChannel;
  followers: number;
  status: InfluencerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface InfluencerRow {
  id: string;
  business_id: string;
  name: string;
  channel: MarketingChannel;
  followers: number;
  status: InfluencerStatus;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
