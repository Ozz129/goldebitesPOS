import type { Business } from '../../businesses/types/business.types';

export type { Business };

export interface CreatePlatformBusinessPayload {
  name: string;
  currency?: string;
  timezone?: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPassword: string;
}

export interface FeatureStatus {
  key: string;
  label: string;
  enabled: boolean;
}

export interface BusinessUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleName: string;
  status: string;
}
