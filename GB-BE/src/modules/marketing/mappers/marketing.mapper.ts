import {
  Campaign,
  CampaignRow,
  ContentItem,
  ContentItemRow,
  Coupon,
  CouponRow,
  Influencer,
  InfluencerRow,
} from '../domain/marketing.interface';

export class MarketingMapper {
  static campaignToDomain(row: CampaignRow): Campaign {
    return {
      id: row.id,
      businessId: row.business_id,
      name: row.name,
      channel: row.channel,
      status: row.status,
      budget: parseFloat(row.budget),
      spent: parseFloat(row.spent),
      reach: row.reach,
      clicks: row.clicks,
      conversions: row.conversions,
      startDate: row.start_date,
      endDate: row.end_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static couponToDomain(row: CouponRow): Coupon {
    return {
      id: row.id,
      businessId: row.business_id,
      code: row.code,
      discountLabel: row.discount_label,
      usageCount: row.usage_count,
      maxUsage: row.max_usage,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static contentItemToDomain(row: ContentItemRow): ContentItem {
    return {
      id: row.id,
      businessId: row.business_id,
      scheduledDate: row.scheduled_date,
      title: row.title,
      channel: row.channel,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static influencerToDomain(row: InfluencerRow): Influencer {
    return {
      id: row.id,
      businessId: row.business_id,
      name: row.name,
      channel: row.channel,
      followers: row.followers,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
