import { Inject, Injectable } from '@nestjs/common';
import {
  ALL_FEATURE_KEYS,
  FEATURE_MODULES,
  isKeyEnabled,
} from '../../../common/constants/feature-modules.constants';
import { EntityNotFoundException } from '../../../common/exceptions';
import { PLATFORM_FEATURE_FLAGS_REPOSITORY } from '../repositories/platform-feature-flags.repository.interface';
import type { IPlatformFeatureFlagsRepository } from '../repositories/platform-feature-flags.repository.interface';

export interface PlatformFeatureFlagStatus {
  key: string;
  label: string;
  enabled: boolean;
  moduleKey: string;
  moduleLabel: string;
}

@Injectable()
export class PlatformFeatureFlagsService {
  constructor(
    @Inject(PLATFORM_FEATURE_FLAGS_REPOSITORY)
    private readonly repository: IPlatformFeatureFlagsRepository,
  ) {}

  /** Every catalog key (module or sub-feature) currently enabled platform-wide, cascade already applied. */
  async getEnabledKeys(): Promise<string[]> {
    const disabled = new Set(await this.repository.findDisabledKeys());
    return ALL_FEATURE_KEYS.filter((key) => isKeyEnabled(key, disabled));
  }

  async getCatalog(): Promise<PlatformFeatureFlagStatus[]> {
    const disabled = new Set(await this.repository.findDisabledKeys());
    return FEATURE_MODULES.flatMap((module) => [
      {
        key: module.key,
        label: module.label,
        enabled: isKeyEnabled(module.key, disabled),
        moduleKey: module.key,
        moduleLabel: module.label,
      },
      ...(module.subFeatures ?? []).map((sub) => ({
        key: sub.key,
        label: sub.label,
        enabled: isKeyEnabled(sub.key, disabled),
        moduleKey: module.key,
        moduleLabel: module.label,
      })),
    ]);
  }

  async setFlag(featureKey: string, enabled: boolean): Promise<void> {
    if (!ALL_FEATURE_KEYS.includes(featureKey)) {
      throw new EntityNotFoundException('Feature', featureKey);
    }
    await this.repository.setEnabled(featureKey, enabled);
  }
}
