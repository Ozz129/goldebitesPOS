import { Inject, Injectable } from '@nestjs/common';
import {
  FEATURE_MODULE_KEYS,
  FEATURE_MODULES,
} from '../../../common/constants/feature-modules.constants';
import { BUSINESS_FEATURES_REPOSITORY } from '../repositories/business-features.repository.interface';
import type { IBusinessFeaturesRepository } from '../repositories/business-features.repository.interface';

export interface FeatureStatus {
  key: string;
  label: string;
  enabled: boolean;
}

@Injectable()
export class BusinessFeaturesService {
  constructor(
    @Inject(BUSINESS_FEATURES_REPOSITORY)
    private readonly businessFeaturesRepository: IBusinessFeaturesRepository,
  ) {}

  /** All feature keys enabled for a business — the full catalog minus any explicitly disabled ones. */
  async getEnabledKeys(businessId: string): Promise<string[]> {
    const disabled = new Set(
      await this.businessFeaturesRepository.findDisabledKeys(businessId),
    );
    return FEATURE_MODULE_KEYS.filter((key) => !disabled.has(key));
  }

  async getEffectiveCatalog(businessId: string): Promise<FeatureStatus[]> {
    const disabled = new Set(
      await this.businessFeaturesRepository.findDisabledKeys(businessId),
    );
    return FEATURE_MODULES.map((feature) => ({
      ...feature,
      enabled: !disabled.has(feature.key),
    }));
  }

  async setFeature(
    businessId: string,
    featureKey: string,
    enabled: boolean,
  ): Promise<void> {
    await this.businessFeaturesRepository.setEnabled(
      businessId,
      featureKey,
      enabled,
    );
  }
}
