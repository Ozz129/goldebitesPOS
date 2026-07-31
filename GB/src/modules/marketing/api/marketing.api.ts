import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse, PaginatedResponse } from '../../../lib/api/api-types';
import type {
  Campaign,
  CampaignFilters,
  ContentItem,
  ContentItemFilters,
  Coupon,
  CouponFilters,
  CreateCampaignPayload,
  CreateContentItemPayload,
  CreateCouponPayload,
  CreateInfluencerPayload,
  Influencer,
  InfluencerFilters,
  UpdateCampaignPayload,
  UpdateContentItemPayload,
  UpdateCouponPayload,
  UpdateInfluencerPayload,
} from '../types/marketing.types';

export const campaignsApi = {
  async getCampaigns(filters: CampaignFilters = {}): Promise<PaginatedResponse<Campaign>> {
    const { data } = await apiClient.get<PaginatedResponse<Campaign>>('/marketing-campaigns', {
      params: filters,
    });
    return data;
  },
  async createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
    const { data } = await apiClient.post<ApiResponse<Campaign>>('/marketing-campaigns', payload);
    return data.data;
  },
  async updateCampaign(id: string, payload: UpdateCampaignPayload): Promise<Campaign> {
    const { data } = await apiClient.patch<ApiResponse<Campaign>>(`/marketing-campaigns/${id}`, payload);
    return data.data;
  },
  async deleteCampaign(id: string): Promise<void> {
    await apiClient.delete(`/marketing-campaigns/${id}`);
  },
};

export const couponsApi = {
  async getCoupons(filters: CouponFilters = {}): Promise<PaginatedResponse<Coupon>> {
    const { data } = await apiClient.get<PaginatedResponse<Coupon>>('/marketing-coupons', {
      params: filters,
    });
    return data;
  },
  async createCoupon(payload: CreateCouponPayload): Promise<Coupon> {
    const { data } = await apiClient.post<ApiResponse<Coupon>>('/marketing-coupons', payload);
    return data.data;
  },
  async updateCoupon(id: string, payload: UpdateCouponPayload): Promise<Coupon> {
    const { data } = await apiClient.patch<ApiResponse<Coupon>>(`/marketing-coupons/${id}`, payload);
    return data.data;
  },
  async setCouponStatus(id: string, isActive: boolean): Promise<Coupon> {
    const { data } = await apiClient.patch<ApiResponse<Coupon>>(`/marketing-coupons/${id}/status`, {
      isActive,
    });
    return data.data;
  },
  async deleteCoupon(id: string): Promise<void> {
    await apiClient.delete(`/marketing-coupons/${id}`);
  },
};

export const contentItemsApi = {
  async getContentItems(filters: ContentItemFilters = {}): Promise<PaginatedResponse<ContentItem>> {
    const { data } = await apiClient.get<PaginatedResponse<ContentItem>>('/marketing-content-items', {
      params: filters,
    });
    return data;
  },
  async createContentItem(payload: CreateContentItemPayload): Promise<ContentItem> {
    const { data } = await apiClient.post<ApiResponse<ContentItem>>('/marketing-content-items', payload);
    return data.data;
  },
  async updateContentItem(id: string, payload: UpdateContentItemPayload): Promise<ContentItem> {
    const { data } = await apiClient.patch<ApiResponse<ContentItem>>(`/marketing-content-items/${id}`, payload);
    return data.data;
  },
  async deleteContentItem(id: string): Promise<void> {
    await apiClient.delete(`/marketing-content-items/${id}`);
  },
};

export const influencersApi = {
  async getInfluencers(filters: InfluencerFilters = {}): Promise<PaginatedResponse<Influencer>> {
    const { data } = await apiClient.get<PaginatedResponse<Influencer>>('/marketing-influencers', {
      params: filters,
    });
    return data;
  },
  async createInfluencer(payload: CreateInfluencerPayload): Promise<Influencer> {
    const { data } = await apiClient.post<ApiResponse<Influencer>>('/marketing-influencers', payload);
    return data.data;
  },
  async updateInfluencer(id: string, payload: UpdateInfluencerPayload): Promise<Influencer> {
    const { data } = await apiClient.patch<ApiResponse<Influencer>>(`/marketing-influencers/${id}`, payload);
    return data.data;
  },
  async deleteInfluencer(id: string): Promise<void> {
    await apiClient.delete(`/marketing-influencers/${id}`);
  },
};
