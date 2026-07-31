import type { StatusTone } from '../../components/common/StatusChip';
import type { CampaignStatus, ContentItemStatus, InfluencerStatus, MarketingChannel } from './types/marketing.types';

export const MARKETING_CHANNEL_LABELS: Record<MarketingChannel, string> = {
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  FACEBOOK: 'Facebook',
  WHATSAPP: 'WhatsApp',
  GOOGLE_BUSINESS: 'Google Business Profile',
  META_ADS: 'Meta Ads',
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  PLANNED: 'Planificada',
  ACTIVE: 'Activa',
  FINISHED: 'Finalizada',
};

export const CAMPAIGN_STATUS_TONE: Record<CampaignStatus, StatusTone> = {
  PLANNED: 'info',
  ACTIVE: 'success',
  FINISHED: 'neutral',
};

export const CONTENT_STATUS_LABELS: Record<ContentItemStatus, string> = {
  PLANNED: 'Planificado',
  PUBLISHED: 'Publicado',
};

export const CONTENT_STATUS_TONE: Record<ContentItemStatus, StatusTone> = {
  PLANNED: 'info',
  PUBLISHED: 'success',
};

export const INFLUENCER_STATUS_LABELS: Record<InfluencerStatus, string> = {
  CONTACTED: 'Contactado',
  NEGOTIATING: 'Negociando',
  ACTIVE: 'Activo',
  FINISHED: 'Finalizado',
};

export const INFLUENCER_STATUS_TONE: Record<InfluencerStatus, StatusTone> = {
  CONTACTED: 'neutral',
  NEGOTIATING: 'warning',
  ACTIVE: 'success',
  FINISHED: 'info',
};
