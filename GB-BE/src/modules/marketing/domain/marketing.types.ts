export enum MarketingChannel {
  INSTAGRAM = 'INSTAGRAM',
  TIKTOK = 'TIKTOK',
  FACEBOOK = 'FACEBOOK',
  WHATSAPP = 'WHATSAPP',
  GOOGLE_BUSINESS = 'GOOGLE_BUSINESS',
  META_ADS = 'META_ADS',
}

export enum CampaignStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

export enum ContentItemStatus {
  PLANNED = 'PLANNED',
  PUBLISHED = 'PUBLISHED',
}

export enum InfluencerStatus {
  CONTACTED = 'CONTACTED',
  NEGOTIATING = 'NEGOTIATING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

export interface CreateCampaignData {
  businessId: string;
  name: string;
  channel: MarketingChannel;
  budget: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateCampaignData {
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

export interface CampaignQuery {
  businessId: string;
  page: number;
  limit: number;
  status?: CampaignStatus;
  channel?: MarketingChannel;
}

export interface CreateCouponData {
  businessId: string;
  code: string;
  discountLabel: string;
  maxUsage: number;
}

export interface UpdateCouponData {
  code?: string;
  discountLabel?: string;
  usageCount?: number;
  maxUsage?: number;
}

export interface CouponQuery {
  businessId: string;
  page: number;
  limit: number;
  isActive?: boolean;
}

export interface CreateContentItemData {
  businessId: string;
  scheduledDate: string;
  title: string;
  channel: MarketingChannel;
}

export interface UpdateContentItemData {
  scheduledDate?: string;
  title?: string;
  channel?: MarketingChannel;
  status?: ContentItemStatus;
}

export interface ContentItemQuery {
  businessId: string;
  page: number;
  limit: number;
  status?: ContentItemStatus;
  channel?: MarketingChannel;
}

export interface CreateInfluencerData {
  businessId: string;
  name: string;
  channel: MarketingChannel;
  followers?: number;
}

export interface UpdateInfluencerData {
  name?: string;
  channel?: MarketingChannel;
  followers?: number;
  status?: InfluencerStatus;
}

export interface InfluencerQuery {
  businessId: string;
  page: number;
  limit: number;
  status?: InfluencerStatus;
}
